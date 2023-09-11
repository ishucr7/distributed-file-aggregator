import requests
import json
from constants import BACKEND_ENDPOINT
from logger import get_logger

logger = get_logger(__name__)

def send_processed_task_update(processed_files_paths, generated_file_path):
    data = {
        'processedFilesPaths': processed_files_paths,
        'generatedFilePath': generated_file_path
    }
    json_data = json.dumps(data)
    headers = {
        'Content-Type': 'application/json',
    }
    response = requests.post(url, data=json_data, headers=headers)
    if response.status_code == 200:
        logger.info('POST request was successful. Response:')
        logger.info(response.text)
    else:
        raise Exception(f'Request to backend for processed files failed; Status Code {response.status_code}: Response: {response.text}')
