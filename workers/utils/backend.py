import requests
import json
from constants import BACKEND_ENDPOINT
from logger import get_logger

logger = get_logger(__name__)

def send_processed_files(processed_files_paths, processed_files_paths):
    data = {
        'processedFilesPaths': processed_files_paths,
        'generatedFilePath': processed_files_paths
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
