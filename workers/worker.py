from celery import Celery
import cProfile
import os
import requests

from task_manager import TaskManager
from utils.constants import RABBITMQ_PASS, RABBITMQ_USERNAME, RABBITMQ_HOST
from utils.logger import get_logger


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

@app.task(serializer='json', name='process-job')
def process_task(task):
    if ENABLE_PROFILING:
        profiled_task(task, requests_session)
    else:
        manage_task(task, requests_session)
    return task
