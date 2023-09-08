import express from 'express';
import filesCollectionService from '../services/filesCollection.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:filesCollections-controller');

class FilesCollectionsMiddleware {

	async validateFilesCollectionExists(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const filesCollection = await filesCollectionService.readById(req.params.filesCollectionId);
		if (filesCollection) {
			next();
		} else {
			res.status(404).send({
				error: `FilesCollection ${req.params.filesCollectionId} not found`,
			});
		}
	}
	async extractFilesCollectionId(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		req.body._id = req.params.filesCollectionId;
		next();
	}

	/**
	 * Add checks for the following
	 * - If all locations are a valid s3 path
	 * - Is the bucket valid
	 * - Do all the files exist in S3
	 */
}

export default new FilesCollectionsMiddleware();