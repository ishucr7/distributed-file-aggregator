import { QueueName, WorkerName } from '../../common/constants';
import flowerService from '../../common/services/flower.service';
import { CreateWorkerDto } from '../dto/create.worker.dto';
import debug from 'debug';
const log: debug.IDebugger = debug('app:job-service');

class WorkersService  {
	async modifyPoolSize(resource: CreateWorkerDto) {
		return await flowerService.modifyPoolSize(WorkerName, resource.noOfWorkers);
	}

	async getWorker() {
		return await flowerService.getWorker(WorkerName);
	}

	async getNoOfTasksInQueue() {
		return await flowerService.getNoOfTasksInQueue(QueueName);
	}
}

export default new WorkersService();
