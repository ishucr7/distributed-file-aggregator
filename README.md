# dynamofl

# Metrics to Display

## Workers
- no. of workers busy
- no. of workers free

## Jobs
- no. of jobs in queue
- no. of jobs completed
- no. of tasks completed of a job

## Queue
- no. of tasks in queue
- no. of tasks of a job in queue

## Celery command
celery -A main worker --loglevel=INFO -Q dynamofl -n dynamofl
export FLOWER_UNAUTHENTICATED_API=true && celery -A main flower