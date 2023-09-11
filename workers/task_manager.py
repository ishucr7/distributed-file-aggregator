from task_executor import TaskExecutor
from utils.constants import FILE_EXTENSION

class TaskManager:
    def __init__(self, task):
        self.task_file_paths = task["filePaths"]
        self.output_file_path = f'{task["outputDir"]/{task["id"]}}/output.{FILE_EXTENSION}'

    def process(self):
        task_executor = TaskExecutor(self.task_file_paths, self.output_file_path)
        task_executor.execute()
