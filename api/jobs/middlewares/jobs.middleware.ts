import express from 'express';
import jobService from '../services/jobs.service';
import filesCollectionService from '../../files/services/filesCollection.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:jobs-controller');

class JobsMiddleware {

	async validateJobExists(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const job = await jobService.readById(req.params.jobId);
		if (job) {
			next();
		} else {
			res.status(404).send({
				error: `Job ${req.params.jobId} not found`,
			});
		}
	}

	async validateFilesCollectionExists(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const filesCollection = await filesCollectionService.readById(req.body.filesCollectionId);
		if (filesCollection) {
			next();
		} else {
			res.status(404).send({
				error: `FilesCollection ${req.params.filesCollectionId} not found`,
			});
		}
	}

	async extractJobId(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		req.body._id = req.params.jobId;
		next();
	}

	/**
	 * Add checks for the following
	 * - If all locations are a valid s3 path
	 * - Is the bucket valid
	 * - Do all the files exist in S3
	 */
}

export default new JobsMiddleware();