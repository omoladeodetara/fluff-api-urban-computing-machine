import { Injectable } from '@angular/core';
import { Endpoint, Parameter, ApiResponse } from '../models';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: { url: string }[];
  paths: Record<string, Record<string, PathItem>>;
}

interface PathItem {
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Record<string, ResponseObject>;
  security?: SecurityRequirement[];
}

interface ParameterObject {
  name: string;
  in: string;
  required: boolean;
  description?: string;
  schema: { type: string; example?: string };
}

interface RequestBodyObject {
  required: boolean;
  content: Record<string, { schema: { type: string; example?: unknown } }>;
}

interface ResponseObject {
  description: string;
  content?: Record<string, { schema?: { type: string; example?: unknown } }>;
}

interface SecurityRequirement {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToOpenAPI(endpoints: Endpoint[], title: string = 'API Specification', baseUrl: string = ''): string {
    const paths: Record<string, Record<string, PathItem>> = {};

    for (const endpoint of endpoints) {
      const path = endpoint.path || '/';
      if (!paths[path]) {
        paths[path] = {};
      }

      const method = endpoint.method.toLowerCase();
      const pathItem: PathItem = {
        summary: endpoint.summary || undefined,
        description: endpoint.description || undefined,
        parameters: this.convertParameters(endpoint.parameters),
        responses: this.convertResponses(endpoint.responses)
      };

      if (endpoint.requestBody && (method === 'post' || method === 'put' || method === 'patch')) {
        pathItem.requestBody = this.convertRequestBody(endpoint.requestBody);
      }

      if (endpoint.auth.type !== 'none') {
        pathItem.security = [this.convertAuth(endpoint.auth.type)];
      }

      paths[path][method] = pathItem;
    }

    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title,
        version: '1.0.0'
      },
      paths
    };

    if (baseUrl) {
      spec.servers = [{ url: baseUrl }];
    }

    return JSON.stringify(spec, null, 2);
  }

  private convertParameters(params: Parameter[]): ParameterObject[] {
    return params
      .filter(p => p.location !== 'body')
      .map(p => ({
        name: p.name,
        in: p.location,
        required: p.required,
        description: p.description || undefined,
        schema: {
          type: p.type,
          example: p.example || undefined
        }
      }));
  }

  private convertRequestBody(body: string): RequestBodyObject {
    let example: unknown = body;
    try {
      example = JSON.parse(body);
    } catch {
      // Use as-is if not valid JSON
    }

    return {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            example
          }
        }
      }
    };
  }

  private convertResponses(responses: ApiResponse[]): Record<string, ResponseObject> {
    const result: Record<string, ResponseObject> = {};

    for (const response of responses) {
      const responseObj: ResponseObject = {
        description: response.description
      };

      if (response.example || response.schema) {
        let example: unknown = response.example;
        try {
          if (response.example) {
            example = JSON.parse(response.example);
          }
        } catch {
          // Use as-is
        }

        responseObj.content = {
          'application/json': {
            schema: {
              type: 'object',
              example
            }
          }
        };
      }

      result[response.statusCode.toString()] = responseObj;
    }

    return result;
  }

  private convertAuth(type: string): SecurityRequirement {
    switch (type) {
      case 'bearer':
        return { bearerAuth: [] };
      case 'basic':
        return { basicAuth: [] };
      case 'apiKey':
        return { apiKeyAuth: [] };
      default:
        return {};
    }
  }

  downloadSpec(spec: string, filename: string = 'api-spec.json'): void {
    const blob = new Blob([spec], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
