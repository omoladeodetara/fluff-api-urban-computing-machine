import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Endpoint, HttpMethod } from '../models';

const STORAGE_KEY = 'api-designer-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ApiBuilderService {
  private endpointsSubject = new BehaviorSubject<Endpoint[]>([]);
  endpoints$ = this.endpointsSubject.asObservable();

  private selectedEndpointSubject = new BehaviorSubject<Endpoint | null>(null);
  selectedEndpoint$ = this.selectedEndpointSubject.asObservable();

  private baseUrlSubject = new BehaviorSubject<string>('http://localhost:3000');
  baseUrl$ = this.baseUrlSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const endpoints = JSON.parse(saved);
        this.endpointsSubject.next(endpoints);
      } catch (error) {
        console.error('Failed to load endpoints from localStorage:', error);
        this.endpointsSubject.next([]);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.endpointsSubject.getValue()));
  }

  setBaseUrl(url: string): void {
    this.baseUrlSubject.next(url);
    localStorage.setItem('api-designer-base-url', url);
  }

  getBaseUrl(): string {
    const saved = localStorage.getItem('api-designer-base-url');
    if (saved) {
      this.baseUrlSubject.next(saved);
    }
    return this.baseUrlSubject.getValue();
  }

  createEndpoint(method: HttpMethod, position: { x: number; y: number }): Endpoint {
    const endpoint: Endpoint = {
      id: uuidv4(),
      method,
      path: '/api/endpoint',
      summary: '',
      description: '',
      parameters: [],
      requestBody: '',
      responses: [{ statusCode: 200, description: 'Successful response' }],
      auth: { type: 'none' },
      position
    };
    
    const endpoints = [...this.endpointsSubject.getValue(), endpoint];
    this.endpointsSubject.next(endpoints);
    this.saveToStorage();
    
    return endpoint;
  }

  updateEndpoint(updated: Endpoint): void {
    const endpoints = this.endpointsSubject.getValue().map(e => 
      e.id === updated.id ? updated : e
    );
    this.endpointsSubject.next(endpoints);
    this.saveToStorage();
    
    if (this.selectedEndpointSubject.getValue()?.id === updated.id) {
      this.selectedEndpointSubject.next(updated);
    }
  }

  deleteEndpoint(id: string): void {
    const endpoints = this.endpointsSubject.getValue().filter(e => e.id !== id);
    this.endpointsSubject.next(endpoints);
    this.saveToStorage();
    
    if (this.selectedEndpointSubject.getValue()?.id === id) {
      this.selectedEndpointSubject.next(null);
    }
  }

  selectEndpoint(endpoint: Endpoint | null): void {
    this.selectedEndpointSubject.next(endpoint);
  }

  getEndpoints(): Endpoint[] {
    return this.endpointsSubject.getValue();
  }

  clearAll(): void {
    this.endpointsSubject.next([]);
    this.selectedEndpointSubject.next(null);
    this.saveToStorage();
  }
}
