import json

from celery import Celery
from task_manager import TaskManager
from utils.constants import RABBITMQ_PASS, RABBITMQ_USERNAME, RABBITMQ_HOST
app = Celery('main', broker=f'pyamqp://{RABBITMQ_USERNAME}:{RABBITMQ_PASS}@{RABBITMQ_HOST}')

@app.task(serializer='json', name='process-job')
def process_task(task):
    task_manager = TaskManager(task)
    task_manager.process()
    return task
