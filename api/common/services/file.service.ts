import debug from 'debug';
import * as fs from 'fs';

const log: debug.IDebugger = debug('app:s3-service');

export class FileService {
    public static writeToFile(filePath: string, fileContent: string): void {
        fs.writeFileSync(filePath, fileContent);
    }

    public static doesPathExist(path: string): boolean {
        return fs.existsSync(path);
    }

    public static createDir(path: string): void {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {recursive: true});
        }
    }
}
