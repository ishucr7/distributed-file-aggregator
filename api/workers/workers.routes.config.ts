import { CommonRoutesConfig } from '../common/common.routes.config';
import WorkersController from './controllers/workers.controller';
import BodyValidationMiddleware from '../common/middlewares/body.validation.middleware';
import { body } from 'express-validator';
import express from 'express';

export class JobsRoutes extends CommonRoutesConfig {
	constructor(app: express.Application) {
		super(app, 'JobsRoutes');
	}

	configureRoutes() {
		this.app
			.route(`/workers`)
			.post(
				body('noOfWorkers')
					.isNumeric()
					.withMessage('noOfWorkers must be provided and its value > 0'),
				BodyValidationMiddleware.verifyBodyFieldsErrors,
				WorkersController.spawnWorkers
			);

		return this.app;
	}
}
