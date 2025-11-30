import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ApiBuilderService } from '../../services/api-builder.service';
import { TestService, TestResult } from '../../services/test.service';
import { Endpoint } from '../../models';

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="api-tester" *ngIf="endpoint">
      <div class="tester-header">
        <span class="method-badge" [class]="endpoint.method.toLowerCase()">
          {{ endpoint.method }}
        </span>
        <span class="test-path">{{ baseUrl }}{{ endpoint.path }}</span>
        <button mat-raised-button color="primary" 
                (click)="runTest()" 
                [disabled]="loading">
          <mat-icon *ngIf="!loading">send</mat-icon>
          <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
          {{ loading ? 'Testing...' : 'Test' }}
        </button>
      </div>
      
      <div class="result-container" *ngIf="result">
        <div class="result-header" [class.success]="result.success" [class.error]="!result.success">
          <span class="status">
            <span *ngIf="result.status">{{ result.status }} {{ result.statusText }}</span>
            <span *ngIf="!result.status && result.error">Error</span>
          </span>
          <span class="duration">{{ result.duration }}ms</span>
        </div>
        
        <div class="result-body">
          <h4>Response Body</h4>
          <pre class="code-block">{{ formatBody(result.body) }}</pre>
        </div>
        
        <div class="result-headers" *ngIf="result.headers">
          <h4>Response Headers</h4>
          <pre class="code-block headers">{{ formatHeaders(result.headers) }}</pre>
        </div>
        
        <div class="error-message" *ngIf="result.error">
          <h4>Error</h4>
          <p>{{ result.error }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-tester {
      padding: 16px;
      border-top: 1px solid #ddd;
      background: #f9f9f9;
    }
    
    .tester-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .method-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      color: white;
    }
    
    .method-badge.get { background: #61affe; }
    .method-badge.post { background: #49cc90; }
    .method-badge.put { background: #fca130; }
    .method-badge.delete { background: #f93e3e; }
    .method-badge.patch { background: #50e3c2; }
    
    .test-path {
      flex: 1;
      font-family: 'Roboto Mono', monospace;
      font-size: 13px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .result-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      font-weight: 500;
    }
    
    .result-header.success {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .result-header.error {
      background: #ffebee;
      color: #c62828;
    }
    
    .duration {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .result-body, .result-headers, .error-message {
      padding: 16px;
      border-top: 1px solid #eee;
    }
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    
    .code-block {
      background: #263238;
      color: #a5d6a7;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      overflow-x: auto;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .code-block.headers {
      color: #90caf9;
    }
    
    .error-message p {
      color: #c62828;
      margin: 0;
    }
  `]
})
export class ApiTesterComponent implements OnInit, OnDestroy {
  endpoint: Endpoint | null = null;
  baseUrl: string = '';
  loading = false;
  result: TestResult | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private apiBuilder: ApiBuilderService,
    private testService: TestService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.baseUrl = this.apiBuilder.getBaseUrl();
    
    this.subscriptions.push(
      this.apiBuilder.selectedEndpoint$.subscribe(endpoint => {
        this.endpoint = endpoint;
        this.result = null;
      }),
      this.apiBuilder.baseUrl$.subscribe(url => {
        this.baseUrl = url;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  runTest(): void {
    if (!this.endpoint) return;
    
    this.loading = true;
    this.result = null;
    
    this.testService.testEndpoint(this.endpoint, this.baseUrl).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;
        
        if (result.success) {
          this.snackBar.open('Request completed successfully', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Request failed', 'Close', { duration: 3000 });
      }
    });
  }

  formatBody(body: unknown): string {
    if (!body) return 'No response body';
    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  }

  formatHeaders(headers: Record<string, string>): string {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
}
