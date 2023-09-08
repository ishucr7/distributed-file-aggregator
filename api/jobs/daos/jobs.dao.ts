import mongooseService from '../../common/services/mongoose.service';
import { CreateJobDto } from "../dto/create.job.dto";
import debug from 'debug';
import shortid from 'shortid';

const log: debug.IDebugger = debug('app:mongodb-dao');

class JobsDao {
	jobs: Array<CreateJobDto> = [];

	Schema = mongooseService.getMongoose().Schema;

	jobSchema = new this.Schema({
		_id: String,
		s3FilePaths: [String],
		permissionFlags: Number,
	}, { id: false });

	Job = mongooseService.getMongoose().model('Jobs', this.jobSchema);
	constructor() {
		log('Created new instance of JobsDao');
	}

	async addJob(jobFields: CreateJobDto) {
		const jobId = shortid.generate();
		const job = new this.Job({
			_id: jobId,
			...jobFields,
			permissionFlags: 1,
		});
		await job.save();
		return jobId;
	}

	async getJobById(jobId: string) {
		return this.Job.findOne({ _id: jobId }).exec();
	}

	async getJobs(limit = 25, page = 0) {
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