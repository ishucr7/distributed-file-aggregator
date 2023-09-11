from task_executor import TaskExecutor
from utils.constants import FILE_EXTENSION
from utils.backend import send_processed_task_update 

class TaskManager:
    def __init__(self, task):
        self.task_file_paths = task["filePaths"]
        self.output_file_path = f'{task["outputDir"]}/output.{FILE_EXTENSION}'

    def process(self):
        task_executor = TaskExecutor(self.task_file_paths, self.output_file_path)
        task_executor.execute()
        send_processed_task_update(self.task_file_paths, self.output_file_path)
