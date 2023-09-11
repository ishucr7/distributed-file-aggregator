from celery import Celery
from task_manager import TaskManager
from utils.constants import RABBITMQ_PASS, RABBITMQ_USERNAME, RABBITMQ_HOST
from utils.logger import get_logger

app = Celery('main', broker=f'pyamqp://{RABBITMQ_USERNAME}:{RABBITMQ_PASS}@{RABBITMQ_HOST}')

logger = get_logger(__name__)

@app.task(serializer='json', name='process-job')
def process_task(task):
    job_id = task["jobId"]
    task_id = task["id"]
    logger.info(f'Received task: Job: {job_id} ; Task: {task_id}')
    task_manager = TaskManager(task)
    task_manager.process()
    logger.info(f'Processed Task: Job: {job_id}; Task: {task_id}')
    return task
