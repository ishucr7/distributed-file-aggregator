import { AxiosInstance, AxiosError } from 'axios';
import {objectToCamel, objectToSnake} from 'ts-case-convert';
import { getServiceError } from './utils/serviceError';

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
        console.log('Request Interceptor:::error', error);
        return Promise.reject(error);
      }
    );

    this.endpoint.interceptors.response.use(
      function (response) {
        response.data = objectToCamel(response.data);
        return response;
      },
      async function (error) {
        const { config, message } = error;
        return Promise.reject(error);
      }
    );   

  }

  getServiceError = getServiceError;
}
