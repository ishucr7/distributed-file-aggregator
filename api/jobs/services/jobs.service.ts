import JobsDao, { JobStatus } from '../daos/jobs.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateJobDto } from '../dto/create.job.dto';
import { DataGeneratorService } from '../../common/services/dataGenerator.service';
import { FileService } from '../../common/services/file.service';
import rabbitmqService from '../../common/services/rabbitmq.service';
import debug from 'debug';
import { SQSService } from '../../common/services/sqs.service';
import { env } from '../../common/constants';
const log: debug.IDebugger = debug('app:job-service');

export interface FileMessage {
	id: string;
	jobId: string;
	s3FileKey: string;
}

class JobsService implements CRUD {
	async create(resource: CreateJobDto) {
		let job = await JobsDao.addJob({
			...resource,
			status: JobStatus.GeneratingFiles,
		});
		const s3FileKeys: string[] = await DataGeneratorService.generateFiles({
			noOfFiles: resource.noOfFiles,
			noOfEntriesPerFile: resource.noOfEntriesPerFile,
			outputDir: `/tmp/dynamofl/jobs/${job._id}/`,
			s3Key: `data/jobs/${job._id}/original-files`,
		});
		job.s3FileKeys = s3FileKeys;
		job.status = JobStatus.Processing;
		job.save();

		const sqs = new SQSService(env.SQS_QUEUE_URL)
		s3FileKeys.map(async (key, ind) => {
			const fileMessageId = `fileMessage-${ind}`;
			const message: FileMessage = {
				id: fileMessageId,
				jobId: job._id,
				s3FileKey: key,
			};
			const messageStr: string = JSON.stringify(message);
			log(`Sending SQS queue, message: ${messageStr}`);
			await sqs.sendMessage({
				message: messageStr,
				messageAttributes: {
					jobId: {
						DataType: "String",
						StringValue: job._id,
					}
				},
				messageGroupId: job._id,
			});
		});
		return job;
	}

	async deleteById(id: string) {
		return JobsDao.removeJobById(id);
	}

	async list(limit: number, page: number) {
		return JobsDao.getJobs();
	}

	async readById(id: string) {
		return JobsDao.getJobById(id);
	}
}

export default new JobsService();
