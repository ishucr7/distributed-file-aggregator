import debug from 'debug';

const log: debug.IDebugger = debug('app:s3-service');

class FileService {

	constructor() {
        // Set up boto3 client
	}
    
    createFile(path: string, content: string) {

    }

    deleteFile(path: string) {

    }

    readFile(path: string) {
        
    }

}
export default new FileService();