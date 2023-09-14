from celery import Celery
from kombu import Exchange, Queue
from celery import bootsteps
from celery.exceptions import Reject

import cProfile
import os
import requests

from task_manager import TaskManager, FileProcessingError
from utils.constants import RABBITMQ_PASS, RABBITMQ_USERNAME, RABBITMQ_HOST
from utils.logger import get_logger
from utils.backend import APIError

ENABLE_PROFILING = True

logger = get_logger(__name__)
requests_session = requests.Session()
app = Celery('main', broker=f'pyamqp://{RABBITMQ_USERNAME}:{RABBITMQ_PASS}@{RABBITMQ_HOST}')


default_queue_name = 'dynamofl'
default_exchange_name = 'dynamofl'
default_routing_key = 'dynamofl'
deadletter_suffix = 'deadletter'
deadletter_queue_name = default_queue_name + f'.{deadletter_suffix}'
deadletter_exchange_name = default_exchange_name + f'.{deadletter_suffix}'
deadletter_routing_key = default_routing_key + f'.{deadletter_suffix}'

class DeclareDLXnDLQ(bootsteps.StartStopStep):
    """
    Celery Bootstep to declare the DL exchange and queues before the worker starts
        processing tasks
    """
    requires = {'celery.worker.components:Pool'}

    def start(self, worker):
        app = worker.app

        # Declare DLX and DLQ
        dlx = Exchange(deadletter_exchange_name, type='direct')

        dead_letter_queue = Queue(
            deadletter_queue_name, dlx, routing_key=deadletter_routing_key)

        with worker.app.pool.acquire() as conn:
            dead_letter_queue.bind(conn).declare()


default_exchange = Exchange(default_exchange_name, type='direct')
default_queue = Queue(
    default_queue_name,
    default_exchange,
    routing_key=default_routing_key,
    queue_arguments={
        'x-dead-letter-exchange': deadletter_exchange_name,
        'x-dead-letter-routing-key': deadletter_routing_key
    })

app.conf.task_queues = (default_queue, )

# Add steps to workers that declare DLX and DLQ if they don't exist
app.steps['worker'].add(DeclareDLXnDLQ)

app.conf.task_default_queue = default_queue_name
app.conf.task_default_exchange = default_exchange_name
app.conf.task_default_routing_key = default_routing_key



def manage_task(task, requests_session):
    task_manager = TaskManager(task)
    task_manager.process(requests_session)

def profiled_task(task, requests_session):
    profiler = cProfile.Profile()
    profiler.enable()
    manage_task(task, requests_session)
    profiler.disable()
    profiler_directory_path = f'/tmp/dynamofl/jobs/{task["jobId"]}/profilers/'
    if not os.path.exists(profiler_directory_path):
        os.mkdir(profiler_directory_path)

    profiler_path = f'{profiler_directory_path}{task["id"]}.prof'
    profiler.dump_stats(profiler_path)

@app.task(serializer='json', name='process-job', autoretry_for=(APIError, FileProcessingError), retry_backoff=True, max_retries=3, acks_late=True)
def process_task(task):
    try:
        if ENABLE_PROFILING:
            profiled_task(task, requests_session)
        else:
            manage_task(task, requests_session)
        return task
    except APIError as e:
        if e.status_code == 500:
            logger.exception(f'API Error: Rejecting task as Backend gave 500: Error: {e}')
            Reject(e, requeue=False)
        elif e.status_code in [400, 401, 403, 429, 502, 503, 504]: # Retriable Status Codes
            logger.info(f'API Error: Retrying as status code is {e.status_code}: Original Error: {e}')
            raise e
        else:
            logger.exception(f'API Error: Rejecting task as Backend gave {e.status_code}; Error: {e}')
            Reject(e, requeue=False)
    except FileProcessingError:
        raise
    except Exception as e:
        logger.exception(f'Unkown Error: Rejecting; Error: {e}')
        Reject(e, requeue=False)
