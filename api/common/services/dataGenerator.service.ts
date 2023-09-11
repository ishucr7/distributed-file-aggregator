import debug from 'debug';
import * as path from 'path';

import {RandomNumberGenerator} from './randomNumberGenerator.service';
import {FileService} from './file.service';
import { S3Service } from './s3.aws.service';
import { env } from '../constants';

const log: debug.IDebugger = debug('app:dataGenerator-service');

export interface FileGeneratorConfig {
    outputDir: string;
    noOfFiles: number;
    noOfEntriesPerFile: number;
    s3Key: string;
}

export class DataGeneratorService {

    public static async generateFiles(fileGeneratorConfig: FileGeneratorConfig): Promise<string[]> {
        const {noOfFiles, outputDir, noOfEntriesPerFile, s3Key} = fileGeneratorConfig;
        FileService.createDir(outputDir);
        const s3 = new S3Service(env.S3_BUCKET);
        const s3FileKeys: string[] = [];
        for(let i = 1; i<=noOfFiles; i++) {
            const fileName = `file_${i}.txt`;
            const filePath = path.join(outputDir, fileName);
            const randomNumbers = RandomNumberGenerator.generateRandomNumbers(noOfEntriesPerFile);
            const fileContent = randomNumbers.join(' ');
            FileService.writeToFile(filePath, fileContent);
            const s3FileKey = `${s3Key}/${fileName}`
            await s3.uploadFile(s3FileKey, filePath)
            s3FileKeys.push(s3FileKey);
        }
        return s3FileKeys;
    }
}
