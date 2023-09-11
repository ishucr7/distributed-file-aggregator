import express from 'express';

import workersService from '../services/workers.service';


import debug from 'debug';

const log: debug.IDebugger = debug('app:workers-controller');

class WorkersController {

    async spawnWorkers(req: express.Request, res: express.Response) {
        await workersService.spawnWorkers(req.body);
        res.status(200).send({});
    }
}

export default new WorkersController();