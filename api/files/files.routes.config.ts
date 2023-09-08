import { CommonRoutesConfig } from '../common/common.routes.config';
import FilesCollectionController from './controllers/filesCollection.controller';
import FilesCollectionsMiddleWare from './middlewares/filesCollection.middleware';
import BodyValidationMiddleware from '../common/middlewares/body.validation.middleware';
import { body } from 'express-validator';
import express from 'express';

export class FilesRoutes extends CommonRoutesConfig {
	constructor(app: express.Application) {
		super(app, 'FilesRoutes');
	}

	configureRoutes() {
		this.app
			.route(`/fileCollections`)
			.get(FilesCollectionController.listFilesCollections)
			.post(
				body('s3FilePaths')
					.isArray()
					.isLength({min:1})
					.withMessage('Must include s3FilePaths with atleast 1 file path'),
				BodyValidationMiddleware.verifyBodyFieldsErrors,
				FilesCollectionController.createFilesCollection
			);

		this.app.param(`fileCollectionId`, FilesCollectionsMiddleWare.extractFilesCollectionId);

		this.app
			.route(`/fileCollections/:fileCollectionId`)
			.all(FilesCollectionsMiddleWare.validateFilesCollectionExists)
			.get(FilesCollectionController.getFilesCollectionById)
			.delete(FilesCollectionController.removeFilesCollection);

		return this.app;
	}
}
