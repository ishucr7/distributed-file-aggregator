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
				body('noOfFiles')
					.isNumeric()
					.withMessage('noOfFiles must be provided and its value > 1'),
				body('noOfEntriesPerFile')
					.isNumeric()
					.withMessage('noOfEntriesPerFile must be provided and its value > 0'),
					BodyValidationMiddleware.verifyBodyFieldsErrors,
				JobsController.createJob
			);

		this.app.param(`jobId`, JobsMiddleWare.extractJobId);

		this.app
			.route(`/jobs/:jobId`)
			.all(JobsMiddleWare.validateJobExists)
			.get(JobsController.getJobById)
			.delete(JobsController.removeJob);

		this.app
			.route(`/jobs/:jobId/processed-task`)
			.all(JobsMiddleWare.validateJobExists)
			.post(
				body('processedFilesPaths')
					.isArray()
					.isLength({min: 1})
					.withMessage('processedFilesPaths must be > 1'),
				body('generatedFilePath')
					.isString()
					.withMessage('generatedFilePath must be present'),	
				BodyValidationMiddleware.verifyBodyFieldsErrors,
				JobsMiddleWare.validateJobIsNotInFailedState,
				JobsController.processFiles
			)
			.delete(JobsController.removeJob);
		return this.app;
	}
}
