import json
from utils.constants import BACKEND_ENDPOINT
from utils.logger import get_logger

logger = get_logger(__name__)

class APIError(Exception):
    """Custom exception for API-related errors."""
    def __init__(self, message, status_code):
        super().__init__(message)
        self.status_code = status_code

def send_processed_task_update(requests_session, job_id, task_id, processed_files_paths, generated_file_path):
    data = {
        'task_id': task_id,
        'processed_files_paths': processed_files_paths,
        'generated_file_path': generated_file_path
    }
    json_data = json.dumps(data)
    headers = {
        'Content-Type': 'application/json',
    }
    response = requests_session.post(f"{BACKEND_ENDPOINT}/jobs/{job_id}/processed-task", data=json_data, headers=headers)
    logger.info(f'Sent request to processed task endpoint with body: {data} for job: {job_id}')
    if response.status_code == 200:
        logger.info('POST request was successful. Response:')
        logger.info(response.text)
    else:
        raise APIError(f'Request to backend for processed files failed; Status Code {response.status_code}: Response: {response.text}', response.status_code)
