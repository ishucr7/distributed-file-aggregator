import os

FILE_EXTENSION = "txt"
RABBITMQ_USERNAME = os.getenv("RABBITMQ_USERNAME", "dynamofl")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "dynamofl")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")