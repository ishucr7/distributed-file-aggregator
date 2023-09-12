import { HttpService, ApiError } from './httpService';
import { ok, err, Result } from 'neverthrow';
import { AxiosInstance } from 'axios';


export interface ModifyPoolSizeInput {
    noOfWorkers: number;
}

interface Queue {
  name: string;
  messages?: number;
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

export interface WorkerServiceInterface {
  modifyPoolSize(modifyPoolSizeInput: ModifyPoolSizeInput): Promise<Result<{message: string}, ApiError>>;
  getWorker(): Promise<Result<Worker, ApiError>>;
}

export class WorkerService
  extends HttpService
  implements WorkerServiceInterface
{
  constructor(endpoint: AxiosInstance) {
    super(endpoint);
  }

  modifyPoolSize = async (modifyPoolSizeInput: ModifyPoolSizeInput): Promise<Result<{message: string}, ApiError>> => {
    const urlPath = `workers`;
    try {
      const response: { data: {message: string} } = await this.endpoint.post(urlPath, modifyPoolSizeInput);
      return ok(response.data);
    } catch (error: any) {
      return err(this.getServiceError(error));
    }
  };

  getWorker = async (): Promise<Result<Worker, ApiError>> => {
    const urlPath = `workers`;
    try {
      const response: { data: Worker } = await this.endpoint.get(urlPath, {});
      return ok(response.data);
    } catch (error: any) {
      return err(this.getServiceError(error));
    }
  };
}