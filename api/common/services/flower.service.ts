import logger from '../logger';
import { WorkerName, env } from '../constants';
import { HttpService } from './http.service';
import axios, { AxiosInstance } from 'axios';
import debug from 'debug';

const log: debug.IDebugger = debug('app:workers-controller');


interface Queue {
    name: string;
}

interface Pool {
    maxConcurrency: number;
    processes: number[];
}

interface Stats {
    pool: Pool;
}

export interface Worker {
    activeQueues: Queue[];
    stats: Stats
}

export interface Workers {
    [key:string]: Worker;
}

interface PoolSizeRequestResponse {
    message: string;
}

export class FlowerService extends HttpService {

    private static flowerBaseUrl: string = env.FLOWER_ENDPOINT;

    constructor() {
        const endpoint: AxiosInstance = axios.create({
            baseURL: FlowerService.flowerBaseUrl,
            timeout: 30000,
        });
        super(endpoint);
    }

    public async getWorker(): Promise<Worker|null> {
        const urlPath = `api/workers`
        try {
            const response: {data: Workers} = await this.endpoint.get(urlPath, {});
            log(`Worker api response data ${response.data}`)
            const worker: Worker = response.data[`${WorkerName}`];
            return worker;
        } catch(error) {
            logger.error(`Error in getting worker ${error}`);
            return null;
        }
    }

    private async growPoolSize(workerName: string, by: number): Promise<PoolSizeRequestResponse> {
        const urlPath = `api/worker/pool/grow/${workerName}?n=${by}`;
        const response: {data: PoolSizeRequestResponse} = await this.endpoint.post(urlPath);
        return response.data;
    }

    private async shrinkPoolSize(workerName: string, by: number): Promise<PoolSizeRequestResponse> {
        const urlPath = `api/worker/pool/shrink/${workerName}?n=${by}`;
        const response:{data: PoolSizeRequestResponse} = await this.endpoint.post(urlPath);
        return response.data;
    }

    public async modifyPoolSize(newSize: number): Promise<PoolSizeRequestResponse|null> {
        try {
            log(`Entered modifyPoolSize to new size: ${newSize}`);
            const worker: Worker = (await this.getWorker())!;
            const currentPoolSize = worker.stats.pool.processes.length;
            log(`Existing pool size: ${currentPoolSize}`);

            let response: PoolSizeRequestResponse;
            if (newSize > currentPoolSize) {
                response = await this.growPoolSize(WorkerName, newSize-currentPoolSize);
            } else if(newSize < currentPoolSize) {
                response = await this.shrinkPoolSize(WorkerName, currentPoolSize - newSize);
            } else {
                response = {
                    message: `Already at the same size ${newSize}`
                }
            }
            return response;
        } catch (error) {
            logger.error(`Error in modifying pool size: ${error}`);
            throw error;
        }
    }
}

export default new FlowerService();