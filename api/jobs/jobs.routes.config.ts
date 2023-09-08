import { CommonRoutesConfig } from '../common/common.routes.config';
import express from 'express';

export class JobRoutes extends CommonRoutesConfig {
	constructor(app: express.Application) {
		super(app, 'JobRoutes');
	}

	configureRoutes() {
		this.app.route(`/jobs`)
			.get((req: express.Request, res: express.Response) => {
				res.status(200).send(`List of jobs`);
			})
			.post((req: express.Request, res: express.Response) => {
				res.status(200).send(`Post to jobs`);
			});

		this.app.route(`/jobs/:jobId`)
			.all((req: express.Request, res: express.Response, next: express.NextFunction) => {
				next();
			})
			.get((req: express.Request, res: express.Response) => {
				res.status(200).send(`GET requested for id ${req.params.jobId}`);
			})
			.put((req: express.Request, res: express.Response) => {
				res.status(200).send(`PUT requested for id ${req.params.jobId}`);
			})
			.delete((req: express.Request, res: express.Response) => {
				res.status(200).send(`DELETE requested for id ${req.params.jobId}`);
			});

		return this.app;
	}
}
