from task_executor import TaskExecutor
from utils.constants import FILE_EXTENSION
from utils.backend import send_processed_task_update 

class TaskManager:
    def __init__(self, task):
        self.job_id = task["jobId"]
        self.task_file_paths = task["filePaths"]
        self.output_file_path = f'{task["outputDir"]}/output.{FILE_EXTENSION}'

    def process(self, requests_session):
        task_executor = TaskExecutor(self.task_file_paths, self.output_file_path)
        task_executor.execute()
        send_processed_task_update(requests_session, self.job_id, self.task_file_paths, self.output_file_path)
