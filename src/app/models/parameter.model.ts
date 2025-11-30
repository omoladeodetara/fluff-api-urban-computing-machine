export type ParameterLocation = 'query' | 'path' | 'header' | 'body';
export type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface Parameter {
  id: string;
  name: string;
  type: ParameterType;
  location: ParameterLocation;
  required: boolean;
  description?: string;
  example?: string;
}
