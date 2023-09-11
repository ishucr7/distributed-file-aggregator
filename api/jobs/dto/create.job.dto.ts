import { JobStatus } from "../daos/jobs.dao";

export interface CreateJobDto {
    noOfFiles: number;
    noOfEntriesPerFile: number;
    status: JobStatus
}