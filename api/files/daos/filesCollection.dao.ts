import mongooseService from '../../common/services/mongoose.service';
import { FilesCollectionDto } from "../dto/filesCollection.dto";
import debug from 'debug';
import shortid from 'shortid';

const log: debug.IDebugger = debug('app:mongodb-dao');

class FilesCollectionsDao {
	filesCollections: Array<FilesCollectionDto> = [];

	Schema = mongooseService.getMongoose().Schema;

	filesCollectionSchema = new this.Schema({
		_id: String,
		s3FilePaths: [String],
		permissionFlags: Number,
	}, { id: false });

	Files = mongooseService.getMongoose().model('FilesCollection', this.filesCollectionSchema);
	constructor() {
		log('Created new instance of FilesCollectionsDao');
	}

	async addFilesCollection(filesCollectionFields: FilesCollectionDto) {
		const collectionId = shortid.generate();
		const filesCollection = new this.Files({
			_id: collectionId,
			...filesCollectionFields,
			permissionFlags: 1,
		});
		await filesCollection.save();
		return collectionId;
	}

	async getFilesCollectionById(filesCollectionId: string) {
		return this.Files.findOne({ _id: filesCollectionId }).exec();
	}

	async getFilesCollections(limit = 25, page = 0) {
		return this.Files.find()
			.limit(limit)
			.skip(limit * page)
			.exec();
	}
	
	async removeFilesCollectionById(collectionId: string) {
		return this.Files.deleteOne({ _id: collectionId }).exec();
	}
}

export default new FilesCollectionsDao();
