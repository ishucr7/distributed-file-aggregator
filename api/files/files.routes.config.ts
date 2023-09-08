import { CommonRoutesConfig } from '../common/common.routes.config';
import express from 'express';

export class FilesRoutes extends CommonRoutesConfig {
	constructor(app: express.Application) {
		super(app, 'FilesRoutes');
	}

	configureRoutes() {
		this.app.route(`/files`)
			.post((req: express.Request, res: express.Response) => {
				res.status(200).send(`Create files`);
			});

		return this.app;
	}
}
