import workersService from '../services/workers.service';

import express from 'express';
import debug from 'debug';

const log: debug.IDebugger = debug('app:workers-controller');

class WorkersController {
    async modifyPoolSize(req: express.Request, res: express.Response) {
        const response = await workersService.modifyPoolSize(req.body);
        res.status(200).send(response);
    }

    async getWorker(req: express.Request, res: express.Response) {
        const worker = await workersService.getWorker();
        res.status(200).send(worker);
    }

    async getNoOfTasksInQueue(req: express.Request, res: express.Response) {
        const noOfTasks = await workersService.getNoOfTasksInQueue();
        res.status(200).send({
            noOfTasks
        });
    }
}

export default new WorkersController();