import JobsDao from '../daos/jobs.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateJobDto } from '../dto/create.job.dto';

class JobsService implements CRUD {
	async create(resource: CreateJobDto) {
		return JobsDao.addJob(resource);
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
