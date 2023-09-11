import JobsDao, { JobStatus } from '../daos/jobs.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateJobDto } from '../dto/create.job.dto';
import { DataGeneratorService } from '../../common/services/dataGenerator.service';
import { FileService } from '../../common/services/file.service';
import rabbitmqService from '../../common/services/rabbitmq.service';
import debug from 'debug';
import { ProcessFilesDto } from '../dto/processFiles.dto';
import redisService from '../../common/services/redis.service';
import { RedisPrefixes } from '../../common/constants';
const log: debug.IDebugger = debug('app:job-service');

const groupFiles = (files: string[], groupSize: number) => {
	const groups: string[][] = [];
	for(let i=0; i<files.length; i+=groupSize) {
		const group = files.slice(i, i+groupSize);
		groups.push(group);
	}
	return groups;
}

export interface Task {
	id: string;
	jobId: string;
	filePaths: string[];
	outputDir: string;
}

export interface CeleryTask {
	id: string;
	task: string;
	kwargs: any;
	args: Task[]
	retries: number;
}

class JobsService implements CRUD {
	async create(resource: CreateJobDto) {
		let job = await JobsDao.addJob({
			...resource,
			status: JobStatus.GeneratingFiles,
		});
		const filePaths: string[] = DataGeneratorService.generateFiles({
			noOfFiles: resource.noOfFiles,
			noOfEntriesPerFile: resource.noOfEntriesPerFile,
			outputDir: `/tmp/dynamofl/jobs/${job._id}/`,
		});
		job.filePaths = filePaths;
		job.status = JobStatus.Processing;
		job.save();

		const groups = groupFiles(filePaths, 5);

		const tasks: CeleryTask[] = [];
		groups.map((group, ind) => {
			const taskId = `task-${ind}`;
			const outputDir = `/tmp/dynamofl/jobs/${job._id}/tasks/${taskId}`;
			FileService.createDir(outputDir);
			const task: Task = {
				id: taskId,
				jobId: job._id,
				filePaths: group,
				outputDir
			}
			tasks.push({
				id: `job-${job._id}-task-${ind}`,
				task: 'process-job',
				kwargs: {},
				args: [task],
			    retries: 0,
			})
		});
		await rabbitmqService.connectToRabbitMQ();
		tasks.map((task) => {
			const taskStr: string = JSON.stringify(task);
			log(`Sending to rabbit mq, message: ${taskStr}`);
			rabbitmqService.sendMessage(taskStr);
		})
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

	private async handleJobDsu(jobId: string, processedFilesInput: ProcessFilesDto) {
		const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
		let jobSetValue = await redisService.getSet(jobSetKey);
		log(`jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);

		const {generatedFilePath, processedFilesPaths} = processedFilesInput;
		await redisService.addToSet(jobSetKey, generatedFilePath);
		processedFilesPaths.map(async (key) => {
			await redisService.removeFromSet(jobSetKey, key);
		});
		jobSetValue = await redisService.getSet(jobSetKey);
		log(`Post Job DSU processing: jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
	}

	private async handleNewTaskGeneration(jobId: string, processedFilesInput: ProcessFilesDto) {
		const jobSetKey = `${RedisPrefixes.JobCompletedTaskList}${jobId}`;
	}

	async processFiles(jobId: string, processedFilesInput: ProcessFilesDto) {
		await this.handleJobDsu(jobId, processedFilesInput);
		await this.handleNewTaskGeneration(jobId, processedFilesInput);
	}
}

export default new JobsService();
