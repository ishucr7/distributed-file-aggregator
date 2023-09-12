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
  }

  getServiceError = getServiceError;
}
