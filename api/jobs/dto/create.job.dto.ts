import { JobStatus } from "../daos/jobs.dao";

export interface CreateJobDto {
    numberOfFiles: number;
    numberOfEntriesPerFile: number;
    status: JobStatus
}