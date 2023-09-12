import { AxiosInstance, AxiosError } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
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
            config.data = snakecaseKeys(config.data, { deep: true });
          }
          return config;
        },
        (error) => {
          logger.error('Request Interceptor:::error', error);
          return Promise.reject(error);
        }
      );

      endpoint.interceptors.response.use(
        function (response) {
          response.data = camelcaseKeys(response.data, { deep: true });
          return response;
        },
        async function (error) {
          const { config, message } = error;
          return Promise.reject(error);
        }
      );   
  }
}