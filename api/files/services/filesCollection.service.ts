import FilesCollectionsDao from '../daos/filesCollection.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateFilesCollectionDto } from '../dto/create.filesCollection.dto';

class FilesCollectionsService implements CRUD {
	async create(resource: CreateFilesCollectionDto) {
        const f = resource.numberOfFiles;
        const n = resource.numberOfEntries;
        // Generate files using resource and store them in s3
        const filesCollection = {
            s3FilePaths: []
        }
		return FilesCollectionsDao.addFilesCollection(filesCollection);
	}

	async deleteById(id: string) {
		return FilesCollectionsDao.removeFilesCollectionById(id);
	}

	async list(limit: number, page: number) {
		return FilesCollectionsDao.getFilesCollections();
	}

	async readById(id: string) {
		return FilesCollectionsDao.getFilesCollectionById(id);
	}
}

export default new FilesCollectionsService();
