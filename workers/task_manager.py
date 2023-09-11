import shortuuid
from task_executor import TaskExecutor
from utils.constants import FILE_EXTENSION, S3_BUCKET
from utils.aws import download_files_from_s3, upload_file_to_s3

class TaskManager:
    temp_output_dir = '/tmp/data/'
    def __init__(self, job_id, s3_keys):
        self.task_id = shortuuid.uuid()
        self.s3_keys = s3_keys
        self.input_files_dir = f'{self.temp_output_dir}/jobs/{job_id}/tasks/{self.task_id}/inputs'
        self.output_file_path = f'{self.temp_output_dir}/jobs/{job_id}/tasks/{self.task_id}/output.{FILE_EXTENSION}'
        self.output_file_s3_key = f'data/jobs/{job_id}/tasks/{self.task_id}/output.{FILE_EXTENSION}'

    def process(self):
        # Call backend: Create task and store the task id too
        task_file_paths = download_files_from_s3(S3_BUCKET, self.s3_keys, self.input_files_dir)
        task_executor = TaskExecutor(task_file_paths, self.output_file_path)
        task_executor.execute()
        upload_file_to_s3(S3_BUCKET, self.output_file_path, self.output_file_s3_key)
        # Call backend: Task ended
           # Backend then decides to put the file into the queue or not
