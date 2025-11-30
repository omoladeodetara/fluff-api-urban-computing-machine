import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Endpoint, AuthConfig, Parameter } from '../models';

// Methods that support request body
const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

export interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
  headers?: Record<string, string>;
  error?: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) {}

  testEndpoint(endpoint: Endpoint, baseUrl: string): Observable<TestResult> {
    const startTime = Date.now();
    const url = this.buildUrl(baseUrl, endpoint.path, endpoint.parameters);
    const headers = this.buildHeaders(endpoint.auth, endpoint.parameters, endpoint.method);
    const params = this.buildParams(endpoint.parameters);

    let request$: Observable<HttpResponse<unknown>>;

    const options = {
      headers,
      params,
      observe: 'response' as const,
      responseType: 'json' as const
    };

    switch (endpoint.method) {
      case 'GET':
        request$ = this.http.get<unknown>(url, options);
        break;
      case 'POST':
        request$ = this.http.post<unknown>(url, this.parseBody(endpoint.requestBody), options);
        break;
      case 'PUT':
        request$ = this.http.put<unknown>(url, this.parseBody(endpoint.requestBody), options);
        break;
      case 'DELETE':
        request$ = this.http.delete<unknown>(url, options);
        break;
      case 'PATCH':
        request$ = this.http.patch<unknown>(url, this.parseBody(endpoint.requestBody), options);
        break;
      default:
        return of({
          success: false,
          error: 'Unsupported HTTP method',
          duration: Date.now() - startTime
        });
    }

    return request$.pipe(
      map((httpResponse: HttpResponse<unknown>) => {
        const responseHeaders: Record<string, string> = {};
        httpResponse.headers.keys().forEach((key: string) => {
          const value = httpResponse.headers.get(key);
          if (value) {
            responseHeaders[key] = value;
          }
        });

        return {
          success: true,
          status: httpResponse.status,
          statusText: httpResponse.statusText,
          body: httpResponse.body,
          headers: responseHeaders,
          duration: Date.now() - startTime
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return of({
          success: false,
          status: error.status,
          statusText: error.statusText,
          body: error.error,
          error: error.message || 'Request failed',
          duration: Date.now() - startTime
        });
      })
    );
  }

  private buildUrl(baseUrl: string, path: string, params: Parameter[]): string {
    let fullPath = path;
    
    // Replace path parameters with URL-encoded values
    params
      .filter(p => p.location === 'path')
      .forEach(p => {
        fullPath = fullPath.replace(`{${p.name}}`, encodeURIComponent(p.example || ''));
      });

    return `${baseUrl.replace(/\/$/, '')}${fullPath}`;
  }

  private buildHeaders(auth: AuthConfig, params: Parameter[], method: string): HttpHeaders {
    let headers = new HttpHeaders();
    
    // Only set Content-Type for methods that have a request body
    if (METHODS_WITH_BODY.includes(method)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    // Add auth headers
    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          headers = headers.set('Authorization', `Bearer ${auth.token}`);
        }
        break;
      case 'basic':
        if (auth.username && auth.password) {
          // Use TextEncoder for proper Unicode support in Basic Auth
          const credentials = `${auth.username}:${auth.password}`;
          const encoded = btoa(unescape(encodeURIComponent(credentials)));
          headers = headers.set('Authorization', `Basic ${encoded}`);
        }
        break;
      case 'apiKey':
        if (auth.apiKeyLocation === 'header' && auth.apiKeyName && auth.apiKeyValue) {
          // Sanitize the API key value to prevent header injection
          const sanitizedValue = auth.apiKeyValue.replace(/[\r\n]/g, '');
          headers = headers.set(auth.apiKeyName, sanitizedValue);
        }
        break;
    }

    // Add header parameters
    params
      .filter(p => p.location === 'header')
      .forEach(p => {
        if (p.example) {
          headers = headers.set(p.name, p.example);
        }
      });

    return headers;
  }

  private buildParams(params: Parameter[]): HttpParams {
    let httpParams = new HttpParams();

    params
      .filter(p => p.location === 'query')
      .forEach(p => {
        if (p.example) {
          httpParams = httpParams.set(p.name, p.example);
        }
      });

    return httpParams;
  }

  private parseBody(body: string | undefined): unknown {
    if (!body) {
      return {};
    }
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
}
