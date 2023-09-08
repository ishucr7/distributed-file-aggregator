import express from 'express';

import jobsService from '../services/jobs.service';


import debug from 'debug';

const log: debug.IDebugger = debug('app:jobs-controller');

class JobsController {
    async listJobs(req: express.Request, res: express.Response) {
        const jobs = await jobsService.list(100, 0);
        res.status(200).send(jobs);
    }

    async getJobById(req: express.Request, res: express.Response) {
        const job = await jobsService.readById(req.body.id);
        res.status(200).send(job);
    }

    async createJob(req: express.Request, res: express.Response) {
        const jobId = await jobsService.create(req.body);
        res.status(201).send({ id: jobId });
    }

    async removeJob(req: express.Request, res: express.Response) {
        log(await jobsService.deleteById(req.body.id));
        res.status(204).send();
    }
}

export default new JobsController();