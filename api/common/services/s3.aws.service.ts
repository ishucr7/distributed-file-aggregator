import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import debug from 'debug';
import { FileService } from "./file.service";
import { env } from "../constants";

const log: debug.IDebugger = debug('app:s3-service');

export class S3Service {

	private client: S3Client;
    private bucket: string;
	private region: string = env.AWS_REGION;

	constructor(bucket: string) {
		this.bucket = bucket;
		this.client = new S3Client({region: this.region});
	}

	public async uploadObject(key: string, content: string) {
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,			
			Body: content,
		});
		const response = await this.client.send(command);
		return response;
	}

	public async uploadFile(key: string, filePath: string) {
		log(`Uploading file at: ${filePath} to ${key}`);
		const readable = FileService.getReadableFileStream(filePath);
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,			
			Body: readable,
		});
		const response = await this.client.send(command);
		return response;
	}
}
