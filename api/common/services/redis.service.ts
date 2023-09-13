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

	async incrementBy(key: string, value: number): Promise<void> {
		await this.client.INCRBY(key, value);
	}

	async decrementBy(key: string, value: number): Promise<void> {
		await this.client.DECRBY(key, value);
	}

	async addToSet(setName: string, value: string|string[]) {
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

	async pushToList(listName: string, value: string | string[]): Promise<number> {
		return await this.client.LPUSH(listName, value);
	}

	async getListSize(listName: string): Promise<number> {
		return await this.client.LLEN(listName);
	}

	async atomicGetAndDeleteEntireList(listName: string): Promise<string[]> {
		const [ extractedList, trimmedResponse] = await this.client
			.multi()
			.LRANGE(listName, 0, -1)
			.LTRIM(listName, 1,0)
			.exec();
		if (trimmedResponse === "OK")
			return extractedList as string[];
		else {
			throw new Error(`Couldn't remove/trimg the list :${listName}`)
		}
	}

	quit(): void {
		this.client.quit();
	}
}

export default new RedisService();
