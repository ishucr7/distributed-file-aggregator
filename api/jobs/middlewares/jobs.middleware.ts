import express from 'express';
import jobService from '../services/jobs.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:jobs-controller');

class JobsMiddleware {

	async validateRequiredJobBodyFields(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		if (req.body && req.body.filePaths && req.body.filePaths.length > 0) {
			next();
		} else {
			res.status(400).send({
				error: `filePaths must be provided with atleast 1 file path`,
			});
		}
	}
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
	async extractJobId(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		req.body.id = req.params.jobId;
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