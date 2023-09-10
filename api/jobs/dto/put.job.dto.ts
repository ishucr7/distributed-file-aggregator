import { JobStatus } from "../daos/jobs.dao";

export interface PutJobDto {
    numberOfFiles: number;
    numberOfEntriesPerFile: number;
    status: JobStatus;
    filePaths: string[];
}