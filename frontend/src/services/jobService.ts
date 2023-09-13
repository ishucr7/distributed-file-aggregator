import { HttpService, ApiError } from './httpService';
import { ok, err, Result } from 'neverthrow';
import { AxiosInstance } from 'axios';


export interface CreateJobInput {
    noOfFiles: number;
    noOfEntriesPerFile: number;
}

export interface Job extends CreateJobInput {
    _id: number;
    status: string;
    progress: number;
    duration: number;
    totalTasks: number;
}
  
export interface JobServiceInterface {
  createJob(createJobInput: CreateJobInput): Promise<Result<Job, ApiError>>;
  getJob(jobId: string): Promise<Result<Job, ApiError>>;
  getJobs(): Promise<Result<Job[], ApiError>>;
}

export class JobService
  extends HttpService
  implements JobServiceInterface
{
  constructor(endpoint: AxiosInstance) {
    super(endpoint);
  }

  createJob = async (createJobInput: CreateJobInput): Promise<Result<Job, ApiError>> => {
    const urlPath = `jobs`;
    try {
      const response: { data: Job } = await this.endpoint.post(urlPath, createJobInput);
      return ok(response.data);
    } catch (error: any) {
      return err(this.getServiceError(error));
    }
  };

  getJob = async (jobId: string): Promise<Result<Job, ApiError>> => {
    const urlPath = `jobs/${jobId}`;
    try {
      const response: { data: Job } = await this.endpoint.get(urlPath, {});
      return ok(response.data);
    } catch (error: any) {
      return err(this.getServiceError(error));
    }
  };

  getJobs = async (): Promise<Result<Job[], ApiError>> => {
    const urlPath = `jobs`;
    try {
      const response: {
        data: Job[];
      } = await this.endpoint.get(urlPath, {});
      return ok(response.data);
    } catch (error: any) {
      return err(this.getServiceError(error));
    }
  };
}