import JobsDao, { JobStatus } from '../daos/jobs.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateJobDto } from '../dto/create.job.dto';
import { DataGeneratorService } from '../../common/services/dataGenerator.service';
import { FileService } from '../../common/services/file.service';
import rabbitmqService from '../../common/services/rabbitmq.service';
import { ProcessFilesDto } from '../dto/processFiles.dto';
import redisService from '../../common/services/redis.service';
import { RedisPrefixes } from '../../common/constants';
import debug from 'debug';
import shortid from 'shortid';
import jobsDao from '../daos/jobs.dao';

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

	private generateTaskFromGroup(group: string[], jobId: string): CeleryTask {
		const taskId = shortid.generate();
		const outputDir = `/tmp/dynamofl/jobs/${jobId}/tasks/${taskId}`;
		FileService.createDir(outputDir);
		const task: Task = {
			id: `task-${taskId}`,
			jobId: jobId,
			filePaths: group,
			outputDir
		}
		const celeryTask: CeleryTask = {
			id: `job-${jobId}-task-${taskId}`,
			task: 'process-job',
			kwargs: {},
			args: [task],
			retries: 0,
		};
		return celeryTask;
	}

	private generateCeleryTasksFromFilePaths(filePaths: string[], jobId: string): CeleryTask[] {
		const groups = groupFiles(filePaths, 5);
		const celeryTasks: CeleryTask[] = [];
		groups.map((group) => {
			const celeryTask: CeleryTask = this.generateTaskFromGroup(group, jobId); 
			celeryTasks.push(celeryTask);
		});
		return celeryTasks;
	}

	private async sendTasksToQueue(tasks: CeleryTask[]) {
		await rabbitmqService.connectToRabbitMQ();
		tasks.map((task) => {
			const taskStr: string = JSON.stringify(task);
			log(`Sending to rabbit mq, message: ${taskStr}`);
			rabbitmqService.sendMessage(taskStr);
		})
	}

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
		const tasks = this.generateCeleryTasksFromFilePaths(filePaths, job._id);
		await this.sendTasksToQueue(tasks);
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
		/**
		 * Order to add first and remove later is important as for checking whether it's ready for aggregation
		 * we're seeing if size is 1.
		 * Initially, all root files will be added to this
		 * In between steps, a new file will be added and old will be removed before the check happens
		 */
		 
		await redisService.addToSet(jobSetKey, generatedFilePath);
		processedFilesPaths.map(async (key) => {
			await redisService.removeFromSet(jobSetKey, key);
		});
		jobSetValue = await redisService.getSet(jobSetKey);
		log(`Post Job DSU processing: jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
	}

	private async handleNewTaskGeneration(jobId: string, processedFilesInput: ProcessFilesDto) {
		const jobCompletedTaskListKey = `${RedisPrefixes.JobCompletedTaskList}${jobId}`;
		const {generatedFilePath} = processedFilesInput;
		await redisService.pushToList(jobCompletedTaskListKey, generatedFilePath);
		const size = await redisService.getListSize(jobCompletedTaskListKey);
		if (size > 1) {
			const completedTaskFilesPaths = await redisService.extractEntireList(jobCompletedTaskListKey);
			// A double check if in case some other process caused to extract the entire list after the size > 1 check
			if(completedTaskFilesPaths.length > 0) {
				const tasks = this.generateCeleryTasksFromFilePaths(completedTaskFilesPaths, jobId);
				await this.sendTasksToQueue(tasks);
			}
		}		
	}

	private async shouldCalculateAggregate(jobId: string): Promise<boolean> {
		const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
		let jobSetValue = await redisService.getSet(jobSetKey);
		log(`jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
		const jobDsuSetSize = await redisService.getSetSize(jobSetKey);
		if (jobDsuSetSize == 1) {
			return true;
		} else {
			return false;
		}
	}

	private async performAggregation(jobId: string, noOfFiles: number) {
		const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
		const finalSumFilePath: string = (await redisService.getSet(jobSetKey))[0];
		const fileContent: string = FileService.readFileAsStr(finalSumFilePath);
		const numbers: number[] = fileContent.split(' ').map(Number);
		const dividedNumbers: number[] = numbers.map((num) => num/noOfFiles!)
		const finalFileResult = dividedNumbers.join(' ');
		FileService.writeToFile(`/tmp/jobs/${jobId}/final.txt`, finalFileResult);
	}

	async processFiles(jobId: string, processedFilesInput: ProcessFilesDto) {
		const job = (await jobsDao.getJobById(jobId))!;
		try {
			await this.handleJobDsu(jobId, processedFilesInput);
			await this.handleNewTaskGeneration(jobId, processedFilesInput);
			const shouldCalculateAggregate = await this.shouldCalculateAggregate(jobId);
			if (shouldCalculateAggregate) {
				job.status = JobStatus.Aggregating;
				job.save();
				await this.performAggregation(jobId, job.noOfFiles!);
				job.status = JobStatus.Completed;
				job.save();
			}	
		} catch(err) {
			job.status = JobStatus.Failed;
			job.save();
		}
	}
}

export default new JobsService();
