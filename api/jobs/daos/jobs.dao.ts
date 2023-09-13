import mongooseService from '../../common/services/mongoose.service';
import { CreateJobDto } from "../dto/create.job.dto";
import debug from 'debug';
import shortid from 'shortid';
import { PatchJobDto } from '../dto/patch.job.dto';
import { JobFileStorageDir } from '../../common/constants';

const log: debug.IDebugger = debug('app:mongodb-dao');

export enum JobStatus {
	GeneratingFiles = 'Generating Files',
	Aggregating = 'Aggregating',
	Processing = 'Processing',
	Completed = 'Completed',
	Failed = 'Failed',
}

class JobsDao {

	Schema = mongooseService.getMongoose().Schema;

	jobSchema = new this.Schema({
		_id: String,
		noOfFiles: {
			type: Number,
			required: true,
		},
		totalTasks: {
			type: Number,
			required: true,
		},
		processingStartTime: {
			type: Date
		},
		processingCompleteTime: {
			type: Date
		},
		noOfEntriesPerFile: {
			type: Number,
			required: true,
		},
		progress: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(JobStatus),
			requried: true
		},
		filePaths: [String],
		outputFilePath: {
			type: String,
			requried: true
		},
		permissionFlags: Number,
	}, { id: false });

	Job = mongooseService.getMongoose().model('Jobs', this.jobSchema);
	constructor() {
		log('Created new instance of JobsDao');
	}

	async addJob(jobFields: CreateJobDto) {
		log(`addJob => jobFields: ${JSON.stringify(jobFields)}`);
		const jobId = shortid.generate();
		const job = new this.Job({
			_id: jobId,
			...jobFields,
			progress: 0,
			totalTasks: 0,
			status: JobStatus.GeneratingFiles,
			outputFilePath: `${JobFileStorageDir}/${jobId}/final.txt`,
			permissionFlags: 1,
		});
		await job.save();
		return job;
	}

	async updateJobById(jobId: string, jobFields: PatchJobDto) {
		const job = await this.Job.findOneAndUpdate(
			{_id: jobId},
			{$set: jobFields},
			{new: true}
		).exec();
		return job;
	}

	async getJobById(jobId: string) {
		return this.Job.findOne({ _id: jobId }).exec();
	}

	async getJobsWithStatus(status: JobStatus) {
		return this.Job.find({
			status
		}).exec();
	}

	async getJobs(limit = 50, page = 0) {
		return this.Job.find()
			.limit(limit)
			.skip(limit * page)
			.exec();
	}
	async removeJobById(jobId: string) {
		return this.Job.deleteOne({ _id: jobId }).exec();
	}
}

export default new JobsDao();