import workersService from '../services/workers.service';

import express from 'express';
import debug from 'debug';

const log: debug.IDebugger = debug('app:workers-controller');

class WorkersController {
    async modifyPoolSize(req: express.Request, res: express.Response) {
        await workersService.modifyPoolSize(req.body);
        res.status(200).send({});
    }
}

export default new WorkersController();