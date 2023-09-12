import flowerService from '../../common/services/flower.service';
import { CreateWorkerDto } from '../dto/create.worker.dto';
import debug from 'debug';
const log: debug.IDebugger = debug('app:job-service');

class WorkersService  {
	async modifyPoolSize(resource: CreateWorkerDto) {
		return await flowerService.modifyPoolSize(resource.noOfWorkers);
	}
}

export default new WorkersService();
