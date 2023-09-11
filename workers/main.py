import json
import shortuuid

from task_manager import TaskManager
from utils.logger import get_logger

logger = get_logger(__name__)

def lambda_handler(event, context):
    records = event['Records']
    job_groups = {}
    for record in records:
        file_message = json.loads(record["body"])
        message_group_id = record['attributes']['messageGroupId']
        job_id = message_group_id
        if job_id not in job_groups:
            job_groups[job_id] = []
        job_groups[job_id].append(file_message)

    for job_id, job_group in job_groups.items():
        s3_keys = []
        for file_message in job_group:
            s3_keys.append(file_message['s3FileKey'])
        task_manager = TaskManager(job_id, shortuuid.uuid(), s3_keys)
        task_manager.process()

    return {
        'statusCode': 200,
        'body': json.dumps('Messages processed successfully.')
    }
