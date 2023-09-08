import { CommonRoutesConfig } from '../common/common.routes.config';
import JobsController from './controllers/jobs.controller';
import JobsMiddleWare from './middlewares/jobs.middleware';
import BodyValidationMiddleware from '../common/middlewares/body.validation.middleware';
import { body } from 'express-validator';
import express from 'express';

export class JobsRoutes extends CommonRoutesConfig {
	constructor(app: express.Application) {
		super(app, 'JobsRoutes');
	}

	configureRoutes() {
		this.app
			.route(`/jobs`)
			.get(JobsController.listJobs)
			.post(
				body('s3FilePaths')
					.isArray()
					.isLength({min:1})
					.withMessage('Must include s3FilePaths with atleast 1 file path'),
				BodyValidationMiddleware.verifyBodyFieldsErrors,
				JobsController.createJob
			);

		this.app.param(`jobId`, JobsMiddleWare.extractJobId);

		this.app
			.route(`/jobs/:jobId`)
			.all(JobsMiddleWare.validateJobExists)
			.get(JobsController.getJobById)
			.delete(JobsController.removeJob);

		return this.app;
	}
}
