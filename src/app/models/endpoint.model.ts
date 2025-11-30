import { Parameter } from './parameter.model';
import { ApiResponse } from './api-response.model';
import { AuthConfig } from './auth-config.model';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  parameters: Parameter[];
  requestBody?: string;
  responses: ApiResponse[];
  auth: AuthConfig;
  position: { x: number; y: number };
}
