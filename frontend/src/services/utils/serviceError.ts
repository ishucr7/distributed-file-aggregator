import { AxiosError } from 'axios';

export const getServiceError = (error: AxiosError): { message: string } => {
  const e = errorResponseToMessages(error.response?.data);
  if (e) return { message: e };

  let message = '';
  if (error.response) {
    const statusCode = error.response.status;
    switch (statusCode) {
      case 400:
        const { Message } = error.response.data as { Message: string };
        message = 'Invalid Request' + (Message ? `: ${Message}` : '');
        break;
      case 404:
        message = 'Resource Not Found';
        break;
      case 401:
        message = 'Unauthorized';
        break;
      case 403:
        message = 'Forbidden Resource';
        break;
      case 500:
        message = 'Internal Server Error';
        break;
    }
  }
  return { message };
};

export const errorResponseToMessages = (err: any) => {
  if (Array.isArray(err)) {
    return err.map((e) => e).join('<br/>');
  }
  if (typeof err === 'string') {
    return err;
  }
  return null;
};