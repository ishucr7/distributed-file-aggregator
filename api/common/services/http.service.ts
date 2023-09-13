import { AxiosInstance } from 'axios';
import { objectToCamel, objectToSnake } from 'ts-case-convert';
import logger from '../logger';

export interface ApiError {
  message: string;
}

export abstract class HttpService {
  protected endpoint: AxiosInstance;

  constructor(endpoint: AxiosInstance) {
    this.endpoint = endpoint;

    this.endpoint.interceptors.request.use(
      async (config) => {
        if (config.data) {
          config.data = objectToSnake(config.data);
        }
        return config;
      },
      (error) => {
        logger.error('Request Interceptor:::error', error);
        return Promise.reject(error);
      },
    );

    endpoint.interceptors.response.use(
      function (response) {
        response.data = objectToCamel(response.data);
        return response;
      },
      async function (error) {
        return Promise.reject(error);
      },
    );
  }
}
