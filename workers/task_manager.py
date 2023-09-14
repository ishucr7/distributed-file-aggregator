from task_executor import TaskExecutor
from utils.constants import FILE_EXTENSION
from utils.backend import send_processed_task_update, APIError
from utils.logger import get_logger

logger = get_logger(__name__)

class FileProcessingError(Exception):
    """Custom exception for file processing errors."""
    def __init__(self, message):
        super().__init__(message)


class TaskManager:
    def __init__(self, task):
        self.job_id = task["jobId"]
        self.task_id = task["id"] # it's the task id of file processor system, not celery
        self.task_file_paths = task["filePaths"]
        self.output_file_path = f'{task["outputDir"]}/output.{FILE_EXTENSION}'

    def process(self, requests_session):
        try:
            task_executor = TaskExecutor(self.task_file_paths, self.output_file_path)
            task_executor.execute()
        except Exception as e:
            raise FileProcessingError(f'Error in processing file: should be retried; Error: {e}')
        send_processed_task_update(requests_session, self.job_id, self.task_id, self.task_file_paths, self.output_file_path)            
