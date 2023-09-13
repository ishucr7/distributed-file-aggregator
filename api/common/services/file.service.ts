import * as fs from 'fs';

export class FileService {
  public static writeToFile(filePath: string, fileContent: string): void {
    fs.writeFileSync(filePath, fileContent);
  }

  public static readFileAsStr(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  public static doesPathExist(path: string): boolean {
    return fs.existsSync(path);
  }

  public static createDir(path: string): void {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
}
