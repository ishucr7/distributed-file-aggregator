# DFL: File Processor

## Primary Goal
- Calculate average of a large number of files by processing them via workers taking load from a queue

## Tech Stack Used
### Core
- Backend: ExpressJS + Typescript
- DB: MongoDB
- Temp DB: REDIS
- Frontend: React + Typescript
- Queue: RabbitMQ
- Worker Framework: Celery

### Monitoring
- Flower: monitoring celery
- Prometheus: To scrape
    - Flower
    - RabbitMQ server
- Grafana: Contains 2 dashboards to display metrics
    - Celery Dashboard
    - RabbitMQ Dashboard
- Profiling: Snakeviz library to profile individual tasks

### Containerization
- Docker: a docker-compose file with following services
    - MongoDB
    - REDIS
    - Celery
    - Flower
    - Prometheus
    - Grafana
- Backend and Frontend aren't dockerized yet


## Input
- W: Number of workers to use
- Job
    - F: Number of files to process
    - C: Number of entries per file
### Slight Catch: Data Simulation
- It's the system's duty to generate F files with C entries each with random data to be processed


## Core Algorithm
- Distributed file processing with the help of workers by using a queue.

### Steps
- Initially take all files, divide into groups of 5, creates a task for each group, submits the task into the queue
- A worker's process, calculates the sum of the files associated with the tasks and informs backend that I'm done
- Backend upon receiving this request does 4 things
    - Updates the DSU: Needed for checking when the job would be finished
    - Adds the task to the list of completed tasks:
    - Checks if the size > 1:
        - retreives the entire list, creates groups of 5 and submits them as task to the queue
    - Checks if the job is ready for aggregation, if yes then performs average and stores the final file


## [Ignore] Some commands used while developing
- Celery command
    - celery -A main worker --loglevel=INFO -Q dynamofl -n dynamofl --concurrency 5
    - export FLOWER_UNAUTHENTICATED_API=true && celery -A main flower --broker_api=http://dynamofl:dynamofl@localhost:15672/api/vhost
