import { SendMessageCommand, SQSClient, MessageAttributeValue } from "@aws-sdk/client-sqs";

export interface MessageAttributes {
    [key: string]: MessageAttributeValue
}

export interface SQSSendMessageInput {
    message: string;
    messageGroupId: string;
    messageAttributes: MessageAttributes;
}

export class SQSService {
    private client: SQSClient;
    private sqsQueueUrl: string

    constructor(queueUrl: string) {
        this.client = new SQSClient({});
        this.sqsQueueUrl = queueUrl;        
    }

    async sendMessage(sqsMessageInput: SQSSendMessageInput) {
        const {message, messageGroupId, messageAttributes} = sqsMessageInput;
        const command = new SendMessageCommand({
            QueueUrl: this.sqsQueueUrl,
            MessageAttributes: messageAttributes,
            MessageGroupId: messageGroupId,
            MessageBody: message
          });
        
          const response = await this.client.send(command);
          return response;
    }    
}
