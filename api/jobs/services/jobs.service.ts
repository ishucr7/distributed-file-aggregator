import JobsDao, { JobStatus } from '../daos/jobs.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateJobDto } from '../dto/create.job.dto';
import { DataGeneratorService } from '../../common/services/dataGenerator.service';

import rabbitmqService from '../../common/services/rabbitmq.service';

const groupFiles = (files: string[], groupSize: number) => {
	const groups: string[][] = [[]];
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
}

class JobsService implements CRUD {
	async create(resource: CreateJobDto): Promise<string> {
		let job = await JobsDao.addJob({
			...resource,
			status: JobStatus.GeneratingFiles,
		});
		const filePaths: string[] = DataGeneratorService.generateFiles({
			noOfFiles: resource.numberOfFiles,
			noOfNumbersPerFile: resource.numberOfEntriesPerFile,
			outputDir: `/tmp/${job._id}`,
		});
		job.status = JobStatus.Processing;
		job.save();

		const groups = groupFiles(filePaths, 5);

		const tasks: Task[] = [];
		groups.map((group, ind) => {
			tasks.push({
				id: `job-${job.id}-task-${ind}`,
				jobId: job.id,
				filePaths: group
			})
		});
		await rabbitmqService.connectToRabbitMQ();
		tasks.map((task) => {
			const taskStr: string = JSON.stringify(task);
			rabbitmqService.sendMessage(taskStr);
		})
		return job.id;
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
