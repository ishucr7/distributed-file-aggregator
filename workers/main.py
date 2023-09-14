from celery import Celery
from celery.exceptions import Reject
import cProfile
import os
import requests

from task_manager import TaskManager, FileProcessingError
from utils.constants import RABBITMQ_PASS, RABBITMQ_USERNAME, RABBITMQ_HOST
from utils.logger import get_logger
from utils.backend import APIError

app = Celery('main', broker=f'pyamqp://{RABBITMQ_USERNAME}:{RABBITMQ_PASS}@{RABBITMQ_HOST}')

logger = get_logger(__name__)
requests_session = requests.Session()

ENABLE_PROFILING = True

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

@app.task(serializer='json', name='process-job', autoretry_for=(APIError, FileProcessingError), retry_backoff=True, max_retries=3)
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
            Reject(requeue=False)
        elif e.status_code in [400, 401, 403, 429, 502, 503, 504]: # Retriable Status Codes
            logger.info(f'API Error: Retrying as status code is {e.status_code}: Original Error: {e}')
            raise e
        else:
            logger.exception(f'API Error: Rejecting task as Backend gave {e.status_code}; Error: {e}')
            Reject(requeue=False)
    except FileProcessingError:
        raise
    except Exception as e:
        logger.exception(f'Unkown Error: Rejecting; Error: {e}')
        Reject(requeue=False)
