import { spawn } from 'child_process';
import logger from '../logger';

export class CeleryService {

    public static spawnCelery(concurrency: number) {
        const child = spawn('celery', ['-A', 'main', '-Q', 'dynamofl', '--concurrency', `${concurrency}`], {cwd: '../../../workers'});
        child.stdout.on('data', (data) => {
            logger.info(data.toString());
        });
          
        child.stderr.on('data', (data) => {
            logger.error(data.toString());
        });
          
        child.on('close', (code) => {
            if (code === 0) {
                logger.info('Command executed successfully.');
            } else {
                logger.error(`Command failed with code ${code}.`);
            }
        });
    }
}