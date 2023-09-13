import { QueueName, RedisPrefixes, WorkerName } from '../../common/constants';
import flowerService from '../../common/services/flower.service';
import { JobStatus } from '../../jobs/daos/jobs.dao';
import jobsService from '../../jobs/services/jobs.service';
import { CreateWorkerDto } from '../dto/create.worker.dto';
import debug from 'debug';
import { WorkerMetricsDto } from '../dto/metric.dto';
import redisService from '../../common/services/redis.service';
const log: debug.IDebugger = debug('app:worker-service');

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

	async getWorkerMetrics(): Promise<WorkerMetricsDto> {
		const noOfJobsInQueue = (await jobsService.getJobsWithStatus(JobStatus.Processing)).length;
		const totalPoolSize = (await flowerService.getWorker(WorkerName))!.stats.pool.processes.length;
		const startedTasks = await flowerService.getTasks(WorkerName, 'STARTED');
		const noOfBusyProcesses = Object.keys(startedTasks).length;
		const noOfIdleProcesses = totalPoolSize - noOfBusyProcesses;
		const noOfTasksInQueueFromFlower = await flowerService.getNoOfTasksInQueue(QueueName);
		const noOfTasksInQueue = Number(await redisService.get(RedisPrefixes.JobTasksInQueue));
		const workerMetrics =  {
			noOfJobsInQueue,
			noOfTasksInQueue,
			noOfIdleProcesses,
			noOfBusyProcesses
		}
		log(`WorkerMetrics: ${JSON.stringify(workerMetrics)}: ${noOfTasksInQueueFromFlower}`);
		return workerMetrics;
	}
}

export default new WorkersService();
