import JobsDao, { JobStatus } from '../daos/jobs.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateJobDto } from '../dto/create.job.dto';
import { DataGeneratorService } from '../../common/services/dataGenerator.service';
import { FileService } from '../../common/services/file.service';
import rabbitmqService from '../../common/services/rabbitmq.service';
import { ProcessFilesDto } from '../dto/processFiles.dto';
import redisService from '../../common/services/redis.service';
import { GroupingSize, JobFileStorageDir, RedisPrefixes } from '../../common/constants';
import debug from 'debug';
import shortid from 'shortid';
import jobsDao from '../daos/jobs.dao';
import logger from '../../common/logger';
import { LinerValidatorResponse } from '../dto/linearValidator.response.dto';

const log: debug.IDebugger = debug('app:job-service');

const groupFiles = (files: string[], groupSize: number) => {
  const groups: string[][] = [];
  for (let i = 0; i < files.length; i += groupSize) {
    const group = files.slice(i, i + groupSize);
    groups.push(group);
  }
  return groups;
};

export interface Task {
  id: string;
  jobId: string;
  filePaths: string[];
  outputDir: string;
}

export interface CeleryTask {
  id: string;
  task: string;
  kwargs: any;
  args: Task[];
  retries: number;
}

class JobsService implements CRUD {
  private generateTaskFromGroup(group: string[], jobId: string): CeleryTask {
    const taskId = shortid.generate();
    const outputDir = `${JobFileStorageDir}/${jobId}/tasks/${taskId}`;
    FileService.createDir(outputDir);
    const task: Task = {
      id: taskId,
      jobId: jobId,
      filePaths: group,
      outputDir,
    };
    const celeryTask: CeleryTask = {
      id: `job-${jobId}-task-${taskId}`,
      task: 'process-job',
      kwargs: {},
      args: [task],
      retries: 0,
    };
    return celeryTask;
  }

  private generateCeleryTasksFromFilePaths(filePaths: string[], jobId: string): CeleryTask[] {
    const groups = groupFiles(filePaths, GroupingSize);
    const celeryTasks: CeleryTask[] = [];
    groups.map((group) => {
      const celeryTask: CeleryTask = this.generateTaskFromGroup(group, jobId);
      celeryTasks.push(celeryTask);
    });
    return celeryTasks;
  }

  private async sendTasksToQueue(jobId: string, tasks: CeleryTask[]) {
    await redisService.addToSet(RedisPrefixes.JobTasksInQueue, tasks.map((task) => `job-${jobId}-task-${task.args[0].id}`));
    await redisService.incrementBy(`${RedisPrefixes.JobTotalTasks}${jobId}`, tasks.length);
    tasks.map((task) => {
      const taskStr: string = JSON.stringify(task);
      rabbitmqService.sendMessage(taskStr);
    });
  }

  async create(resource: CreateJobDto) {
    const job = await JobsDao.addJob({
      ...resource,
    });
    const filePaths: string[] = DataGeneratorService.generateFiles({
      noOfFiles: resource.noOfFiles,
      noOfEntriesPerFile: resource.noOfEntriesPerFile,
      outputDir: `${JobFileStorageDir}/${job._id}/input/`,
    });
    job.filePaths = filePaths;
    job.status = JobStatus.Processing;
    // Excluding the file generation out of the processing time
    job.processingStartTime = new Date();
    await job.save();
    this.addInitialFilesToJobDsu(job._id, filePaths);
    const tasks = this.generateCeleryTasksFromFilePaths(filePaths, job._id);
    await this.sendTasksToQueue(job._id, tasks);
    return job;
  }

  async deleteById(id: string) {
    return JobsDao.removeJobById(id);
  }

  async list(limit: number, page: number) {
    return JobsDao.getJobs(limit, page);
  }

  async getJobsWithStatus(status: JobStatus) {
    return jobsDao.getJobsWithStatus(status);
  }

  async readById(id: string) {
    return JobsDao.getJobById(id);
  }

  private async addInitialFilesToJobDsu(jobId: string, initialFilesPaths: string[]) {
    log(`addInitialFilesToJobDsu: entered`);
    const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
    let jobSetValue = await redisService.getSet(jobSetKey);
    log(`jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
    await redisService.addToSet(jobSetKey, initialFilesPaths);
    jobSetValue = await redisService.getSet(jobSetKey);
    log(`Post Job initial DSU processing: jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
  }

  private async handleJobDsu(jobId: string, processedFilesInput: ProcessFilesDto) {
    log(`handleJobDsu: entered`);
    const job = (await jobsDao.getJobById(jobId))!;
    const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
    let jobSetValue: string[] = await redisService.getSet(jobSetKey);
    log(`jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);

    const { generatedFilePath, processedFilesPaths } = processedFilesInput;
    /**
     * Order to add first and remove later is important as for checking whether it's ready for aggregation
     * we're seeing if size is 1.
     * Initially, all root files will be added to this
     * In between steps, a new file will be added and old will be removed before the check happens
     */

    await redisService.addToSet(jobSetKey, generatedFilePath);
    processedFilesPaths.map(async (key) => {
      await redisService.removeFromSet(jobSetKey, key);
    });
    jobSetValue = await redisService.getSet(jobSetKey);
    job.progress = ((job.noOfFiles - jobSetValue.length + 1) * 100) / job.noOfFiles;
    await job.save();
    log(`Progress of the job: ${jobId} is ${job.progress}`);
    log(`Post Job DSU processing: jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
  }

  private async handleNewTaskGeneration(jobId: string, processedFilesInput: ProcessFilesDto) {
    log(`handleNewTaskGeneration: entered`);
    const jobCompletedTaskListKey = `${RedisPrefixes.JobCompletedTaskList}${jobId}`;
    const { generatedFilePath } = processedFilesInput;
    await redisService.pushToList(jobCompletedTaskListKey, generatedFilePath);
    const size = await redisService.getListSize(jobCompletedTaskListKey);
    log(`Completed task List size: ${size}`);
    if (size > 1) {
      const completedTaskFilesPaths = await redisService.atomicGetAndDeleteEntireList(jobCompletedTaskListKey);
      log(`Completed Task List: ${completedTaskFilesPaths}`);
      // A double check if in case some other process caused to extract the entire list after the size > 1 check
      if (completedTaskFilesPaths.length > 0) {
        log(`Sending completed tasks to the queue for processing`);
        const tasks = this.generateCeleryTasksFromFilePaths(completedTaskFilesPaths, jobId);
        await this.sendTasksToQueue(jobId, tasks);
      }
    }
  }

  private async shouldCalculateAggregate(jobId: string): Promise<boolean> {
    log(`shouldCalculateAggregate: entered`);
    const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
    const jobSetValue = await redisService.getSet(jobSetKey);
    log(`jobSet : ${jobSetKey}, value: ${JSON.stringify(jobSetValue)}`);
    const jobDsuSetSize = await redisService.getSetSize(jobSetKey);
    if (jobDsuSetSize == 1) {
      log(`jobDsuSetSize is 1, so yes aggregate should be calculated`);
      return true;
    } else {
      return false;
    }
  }

  private async performAggregation(jobId: string, noOfFiles: number, outputFilePath: string) {
    const jobSetKey = `${RedisPrefixes.JobDsu}${jobId}`;
    const finalSumFilePath: string = (await redisService.getSet(jobSetKey))[0];
    const fileContent: string = FileService.readFileAsStr(finalSumFilePath);
    const numbers: number[] = fileContent.split(' ').map(Number);
    const dividedNumbers: number[] = numbers.map((num) => num / noOfFiles!);
    const finalFileResult = dividedNumbers.join(' ');
    FileService.writeToFile(outputFilePath, finalFileResult);
  }

  async processFiles(jobId: string, processedFilesInput: ProcessFilesDto) {
    log(`processFiles: entered with input ${JSON.stringify(processedFilesInput)}`);
    const job = (await jobsDao.getJobById(jobId))!;
    try {
      const taskProcessedKey = `${RedisPrefixes.ProcessedTasks}${processedFilesInput.generatedFilePath}`;
      const isTaskAlreadyProcessed = await redisService.get(taskProcessedKey);
      if (!isTaskAlreadyProcessed) {
        logger.info('Processing task as not already processed');
        await redisService.set(taskProcessedKey, '1');
        await this.handleJobDsu(jobId, processedFilesInput);
        await this.handleNewTaskGeneration(jobId, processedFilesInput);
        const shouldCalculateAggregate = await this.shouldCalculateAggregate(jobId);
        if (shouldCalculateAggregate) {
          job.status = JobStatus.Aggregating;
          await job.save();
          await this.performAggregation(jobId, job.noOfFiles!, job.outputFilePath!);
          job.status = JobStatus.Completed;
          job.processingCompleteTime = new Date();
          const totalTasks = Number(await redisService.get(`${RedisPrefixes.JobTotalTasks}${jobId}`));
          job.totalTasks = totalTasks;
          await job.save();  
        }
      } else {
        logger.info(`Already processed task for job: ${jobId}, so ignoring it`);
      }
    } catch (err) {
      logger.error(`Error in process files: ${err}`);
      job.status = JobStatus.Failed;
      await job.save();
    }
  }

  async linearValidator(jobId: string): Promise<LinerValidatorResponse> {
    const startTime = new Date();
    const job = (await jobsDao.getJobById(jobId))!;
    const noOfFiles = job.noOfFiles;

    const allFilesArrays: number[][] = [];
    job.filePaths.forEach((filePath) => {
      const fileData = FileService.readFileAsStr(filePath);
      const numbers = fileData.trim().split(' ').map(Number);
      allFilesArrays.push(numbers);
    });

    const sums: number[] = allFilesArrays.reduce((finalSum, numbers) => {
      numbers.forEach((num, ind) => {
        finalSum[ind] = (finalSum[ind] || 0) + num;
      });
      return finalSum;
    });
    const averages = sums.map((sum) => sum / noOfFiles);
    const outputData: string = averages.join(' ');
    const linearFilePath: string = `${JobFileStorageDir}/${jobId}/linear.txt`;
    FileService.writeToFile(linearFilePath, outputData);
    const outputBySystem: string = FileService.readFileAsStr(job.outputFilePath!);
    const endTime = new Date();
    return {
      isSame: outputBySystem === outputData,
      outputBySystemFilePath: job.outputFilePath!,
      linearFilePath,
      linearProcessingTime: endTime.getTime() - startTime.getTime(),
      systemProcessingTime: job.processingCompleteTime!.getTime() - job.processingStartTime!.getTime(),
    };
  }
}

export default new JobsService();
