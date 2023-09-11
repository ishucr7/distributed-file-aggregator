import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
    RABBITMQ_DEFAULT_USER: str({default: 'dynamofl'}),
    RABBITMQ_DEFAULT_PASS: str({default: 'dynamofl'})
})

export enum RedisPrefixes {
    JobDsu = 'job-dsu-',
    JobCompletedTaskList = 'job-completed-task-list'
}