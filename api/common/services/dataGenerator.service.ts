import * as path from 'path';

import { RandomNumberGenerator } from './randomNumberGenerator.service';
import { FileService } from './file.service';

export interface FileGeneratorConfig {
  outputDir: string;
  noOfFiles: number;
  noOfEntriesPerFile: number;
}

export class DataGeneratorService {
  public static generateFiles(fileGeneratorConfig: FileGeneratorConfig): string[] {
    const { noOfFiles, outputDir, noOfEntriesPerFile } = fileGeneratorConfig;
    FileService.createDir(outputDir);
    const filePaths: string[] = [];
    for (let i = 1; i <= noOfFiles; i++) {
      const fileName = `file_${i}.txt`;
      const filePath = path.join(outputDir, fileName);
      const randomNumbers = RandomNumberGenerator.generateRandomNumbers(noOfEntriesPerFile);
      const fileContent = randomNumbers.join(' ');
      FileService.writeToFile(filePath, fileContent);
      filePaths.push(filePath);
    }
    return filePaths;
  }
}
