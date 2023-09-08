import express from 'express';

import filesCollectionService from '../services/filesCollection.service';


import debug from 'debug';

const log: debug.IDebugger = debug('app:filesCollection-controller');

class FilesCollectionsController {
    async listFilesCollections(req: express.Request, res: express.Response) {
        const filesCollection = await filesCollectionService.list(100, 0);
        res.status(200).send(filesCollection);
    }

    async getFilesCollectionById(req: express.Request, res: express.Response) {
        const filesCollection = await filesCollectionService.readById(req.params.filesCollectionId);
        res.status(200).send(filesCollection);
    }

    async createFilesCollection(req: express.Request, res: express.Response) {
        const filesCollectionId = await filesCollectionService.create(req.body);
        res.status(201).send({ id: filesCollectionId });
    }

    async removeFilesCollection(req: express.Request, res: express.Response) {
        log(await filesCollectionService.deleteById(req.body.id));
        res.status(204).send();
    }
}

export default new FilesCollectionsController();