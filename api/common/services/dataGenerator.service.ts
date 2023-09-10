import debug from 'debug';
import * as path from 'path';

import {RandomNumberGenerator} from './randomNumberGenerator.service';
import {FileService} from './file.service';

const log: debug.IDebugger = debug('app:dataGenerator-service');

export interface FileGeneratorConfig {
    outputDir: string;
    noOfFiles: number;
    noOfNumbersPerFile: number;
}

export class DataGeneratorService {

    public static generateFiles(fileGeneratorConfig: FileGeneratorConfig): string[] {
        const {noOfFiles, outputDir, noOfNumbersPerFile} = fileGeneratorConfig;
        const filePaths: string[] = [];
        for(let i = 1; i<=noOfFiles; i++) {
            const fileName = `file_${i}.txt`;
            const filePath = path.join(outputDir, fileName);
            const randomNumbers = RandomNumberGenerator.generateRandomNumbers(noOfNumbersPerFile);
            const fileContent = randomNumbers.join(' ');
            FileService.writeToFile(filePath, fileContent);
            filePaths.push(filePath);
        }
        return filePaths;
    }
}
