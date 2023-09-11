import { JobStatus } from "../daos/jobs.dao";

export interface PutJobDto {
    noOfFiles: number;
    noOfEntriesPerFile: number;
    status: JobStatus;
    filePaths: string[];
}