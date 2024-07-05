export interface ResponseDto<T> {
  succeeded: boolean;
  responseMessage: string;
  errors?: errorResponse[];
  data: T;
}

interface errorResponse {
  code: string;
  description: string;
}
