import FilesCollectionsDao from '../daos/filesCollection.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateFilesCollectionDto } from '../dto/create.filesCollection.dto';
import { DataGeneratorService } from '../../common/services/dataGenerator.service';
import shortid from 'shortid';

class FilesCollectionsService implements CRUD {
	async create(resource: CreateFilesCollectionDto) {
		const randomId = shortid.generate();
		const filePaths = DataGeneratorService.generateFiles({
			noOfFiles: resource.numberOfFiles,
			noOfNumbersPerFile: resource.numberOfEntries,
			outputDir: `/tmp/${randomId}`,
		});
        const filesCollection = {
            s3FilePaths: filePaths
        };
		return FilesCollectionsDao.addFilesCollection(filesCollection);
	}

	async deleteById(id: string) {
		return FilesCollectionsDao.removeFilesCollectionById(id);
	}

	async list(limit: number, page: number) {
		return FilesCollectionsDao.getFilesCollections(limit, page);
	}

	async readById(id: string) {
		return FilesCollectionsDao.getFilesCollectionById(id);
	}
}

export default new FilesCollectionsService();
