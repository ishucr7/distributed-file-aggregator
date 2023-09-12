import logger from '../logger';
import { WorkerName, env } from '../constants';
import { HttpService } from './http.service';
import axios, { AxiosInstance } from 'axios';


interface Queue {
    name: string;
}

interface Pool {
    "max-concurrency": number;
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
            const response: Workers = await this.endpoint.get(urlPath);
            const worker: Worker = response[`${WorkerName}`];
            return worker;
        } catch(error) {
            logger.error(`Error in getting worker ${error}`);
            return null;
        }
    }

    private async growPoolSize(workerName: string, by: number): Promise<PoolSizeRequestResponse> {
        const urlPath = `api/worker/pool/grow/${workerName}?n=${by}`;
        const response: PoolSizeRequestResponse = await this.endpoint.post(urlPath);
        return response;
    }

    private async shrinkPoolSize(workerName: string, by: number): Promise<PoolSizeRequestResponse> {
        const urlPath = `api/worker/pool/shrink/${workerName}?n=${by}`;
        const response: PoolSizeRequestResponse = await this.endpoint.post(urlPath);
        return response;
    }

    public async modifyPoolSize(newSize: number): Promise<PoolSizeRequestResponse|null> {
        try {
            const worker: Worker = (await this.getWorker())!;
            const currentPoolSize = worker.stats.pool['max-concurrency'];
            if (newSize > currentPoolSize) {
                return await this.growPoolSize(WorkerName, newSize-currentPoolSize);
            } else if(newSize < currentPoolSize) {
                return await this.shrinkPoolSize(WorkerName, currentPoolSize - newSize);
            } else {
                return {
                    message: `Already at the same size ${newSize}`
                }
            }
        } catch (error) {
            logger.error(`Error in modifying pool size: ${error}`);
            return null;
        }
    }
}

export default new FlowerService();