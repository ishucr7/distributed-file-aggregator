import express from 'express';
import jobService from '../services/jobs.service';
import { JobStatus } from '../daos/jobs.dao';
import redisService from '../../common/services/redis.service';
import { RedisPrefixes } from '../../common/constants';

class JobsMiddleware {
  async validateJobExists(req: express.Request, res: express.Response, next: express.NextFunction) {
    const job = await jobService.readById(req.params.jobId);
    if (job) {
      next();
    } else {
      res.status(404).send({
        error: `Job ${req.params.jobId} not found`,
      });
    }
  }

  async validateJobIsNotInFailedState(req: express.Request, res: express.Response, next: express.NextFunction) {
    const job = await jobService.readById(req.params.jobId);
    if (job) {
      /**
       * Why are we using set?
       * - because we need to deal with the case where a task is repeated, we need to make sure it's idempotent
       * - had it been a number, it would have gone wrong as we would have decreased it twice for the same task
       */
      redisService.removeFromSet(RedisPrefixes.JobTasksInQueue, `job-${req.params.jobId}-task-${req.body.taskId}`);
      if (job.status === JobStatus.Failed) {
        res.status(400).send({
          error: `Job ${req.params.jobId} is in failed state`,
        });
      }
      next();
    } else {
      res.status(404).send({
        error: `Job ${req.params.jobId} not found`,
      });
    }
  }

  async extractJobId(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.body._id = req.params.jobId;
    next();
  }

  /**
   * Add checks for the following
   * - If all locations are a valid s3 path
   * - Is the bucket valid
   * - Do all the files exist in S3
   */
}

export default new JobsMiddleware();
