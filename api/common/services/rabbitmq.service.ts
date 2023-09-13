import * as amqp from 'amqplib';
import { env } from '../constants';

class RabbitMQService {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private readonly queueName: string;
  private readonly rabbitMQUrl = `amqp://${env.RABBITMQ_DEFAULT_USER}:${env.RABBITMQ_DEFAULT_PASS}@localhost`;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async connectToRabbitMQ(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitMQUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName);
  }

  async sendMessage(message: string): Promise<void> {
    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      contentType: 'application/json',
    });
  }

  async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export default new RabbitMQService('dynamofl');
