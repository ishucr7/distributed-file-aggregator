import { createClient, RedisClientType } from 'redis';
import debug from 'debug';

const log: debug.IDebugger = debug('app:redis-service');

class RedisService {
	private client: RedisClientType;
	private count = 0;


	constructor() {
		this.client = createClient({});
		this.connectWithRetry();
	}

	connectWithRetry = () => {
		log('Attempting REDIS connection (will retry if needed)');
		this.client.connect()
			.then(() => {
				log('REDIS is connected');
			})
			.catch((err) => {
				const retrySeconds = 5;
				log(
					`Redis connection unsuccessful (will retry #${++this
						.count} after ${retrySeconds} seconds):`,
					err
				);
				setTimeout(this.connectWithRetry, retrySeconds * 1000);
			});
	}

	async set(key: string, value: string): Promise<void> {
		await this.client.set(key, value);
	}

	async get(key: string): Promise<string|null> {
		return await this.client.get(key);
	}

	async delete(key: string): Promise<void> {
		await this.client.del(key);
	}

	async addToSet(setName: string, value: string) {
		await this.client.SADD(setName, value);
	}

	async getSet(setName: string): Promise<string[]> {
		return await this.client.SMEMBERS(setName);
	}

	async removeFromSet(setName: string, value: string) {
		return await this.client.SREM(setName, value);
	}

	async getSetSize(setName: string): Promise<number> {
		return await this.client.SCARD(setName);
	}

	quit(): void {
		this.client.quit();
	}
}

export default new RedisService();
