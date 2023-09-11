import { CeleryService } from '../../common/services/celery.service';
import { CreateWorkerDto } from '../dto/create.worker.dto';
import debug from 'debug';
const log: debug.IDebugger = debug('app:job-service');

class WorkersService  {
	async spawnWorkers(resource: CreateWorkerDto) {
		CeleryService.spawnCelery(resource.noOfWorkers)
	}
}

export default new WorkersService();
