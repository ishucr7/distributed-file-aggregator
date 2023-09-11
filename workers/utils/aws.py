import os
import boto3

def download_files_from_s3(bucket_name, s3_keys, output_dir):
    s3 = boto3.client('s3')
    local_file_paths = []
    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for s3_key in s3_keys:
        local_file_path = os.path.join(output_dir, os.path.basename(s3_key))
        local_file_paths.append(local_file_path)
        s3.download_file(bucket_name, s3_key, local_file_path)
        print(f'Downloaded: {s3_key} to {local_file_path}')
    return local_file_paths

def upload_file_to_s3(bucket_name, file_path, s3_key):
    s3 = boto3.client('s3')
    s3.upload_file(file_path, bucket_name, s3_key)
    print(f'Uploaded: {file_path} to s3://{bucket_name}/{s3_key}')
