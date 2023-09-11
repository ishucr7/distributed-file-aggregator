import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
    RABBITMQ_DEFAULT_USER: str({default: 'dynamofl'}),
    RABBITMQ_DEFAULT_PASS: str({default: 'dynamofl'}),
    SQS_QUEUE_URL: str({default: 'abc'}),
    S3_BUCKET: str({default: 'dynamofl'}),
    AWS_REGION: str({default: 'us-east-1'}),
})
  