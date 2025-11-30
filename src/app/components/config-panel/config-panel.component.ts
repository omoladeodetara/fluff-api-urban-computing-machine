import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ApiBuilderService } from '../../services/api-builder.service';
import { Endpoint, Parameter, ApiResponse, AuthConfig, AuthType, ParameterLocation, ParameterType } from '../../models';

@Component({
  selector: 'app-config-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="config-panel" *ngIf="endpoint; else noSelection">
      <div class="panel-header">
        <span class="method-badge" [class]="endpoint.method.toLowerCase()">
          {{ endpoint.method }}
        </span>
        <mat-form-field class="path-field" appearance="outline">
          <mat-label>Path</mat-label>
          <input matInput [(ngModel)]="endpoint.path" (ngModelChange)="save()">
        </mat-form-field>
      </div>

      <mat-tab-group>
        <!-- General Tab -->
        <mat-tab label="General">
          <div class="tab-content">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Summary</mat-label>
              <input matInput [(ngModel)]="endpoint.summary" (ngModelChange)="save()">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput rows="3" [(ngModel)]="endpoint.description" (ngModelChange)="save()"></textarea>
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Parameters Tab -->
        <mat-tab label="Parameters">
          <div class="tab-content">
            <div class="section-header">
              <span>Parameters</span>
              <button mat-mini-fab color="primary" (click)="addParameter()">
                <mat-icon>add</mat-icon>
              </button>
            </div>
            
            <mat-accordion>
              <mat-expansion-panel *ngFor="let param of endpoint.parameters; let i = index">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="param-name">{{ param.name || 'New Parameter' }}</span>
                    <span class="param-location">{{ param.location }}</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="param-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Name</mat-label>
                    <input matInput [(ngModel)]="param.name" (ngModelChange)="save()">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Location</mat-label>
                    <mat-select [(ngModel)]="param.location" (selectionChange)="save()">
                      <mat-option *ngFor="let loc of paramLocations" [value]="loc">{{ loc }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Type</mat-label>
                    <mat-select [(ngModel)]="param.type" (selectionChange)="save()">
                      <mat-option *ngFor="let type of paramTypes" [value]="type">{{ type }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-checkbox [(ngModel)]="param.required" (change)="save()">Required</mat-checkbox>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Example Value</mat-label>
                    <input matInput [(ngModel)]="param.example" (ngModelChange)="save()">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <input matInput [(ngModel)]="param.description" (ngModelChange)="save()">
                  </mat-form-field>
                  
                  <button mat-button color="warn" (click)="removeParameter(i)">
                    <mat-icon>delete</mat-icon> Remove
                  </button>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
            
            <div *ngIf="endpoint.parameters.length === 0" class="empty-hint">
              No parameters. Click + to add one.
            </div>
          </div>
        </mat-tab>

        <!-- Request Body Tab -->
        <mat-tab label="Request" *ngIf="hasRequestBody">
          <div class="tab-content">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Request Body (JSON)</mat-label>
              <textarea matInput rows="10" [(ngModel)]="endpoint.requestBody" 
                        (ngModelChange)="save()" class="code-input"></textarea>
            </mat-form-field>
          </div>
        </mat-tab>

        <!-- Responses Tab -->
        <mat-tab label="Responses">
          <div class="tab-content">
            <div class="section-header">
              <span>Responses</span>
              <button mat-mini-fab color="primary" (click)="addResponse()">
                <mat-icon>add</mat-icon>
              </button>
            </div>
            
            <mat-accordion>
              <mat-expansion-panel *ngFor="let response of endpoint.responses; let i = index">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="status-code" [class]="getStatusClass(response.statusCode)">
                      {{ response.statusCode }}
                    </span>
                    <span>{{ response.description }}</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                
                <div class="response-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Status Code</mat-label>
                    <mat-select [(ngModel)]="response.statusCode" (selectionChange)="save()">
                      <mat-option *ngFor="let code of statusCodes" [value]="code">{{ code }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <input matInput [(ngModel)]="response.description" (ngModelChange)="save()">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Example Response (JSON)</mat-label>
                    <textarea matInput rows="5" [(ngModel)]="response.example" 
                              (ngModelChange)="save()" class="code-input"></textarea>
                  </mat-form-field>
                  
                  <button mat-button color="warn" (click)="removeResponse(i)">
                    <mat-icon>delete</mat-icon> Remove
                  </button>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- Auth Tab -->
        <mat-tab label="Auth">
          <div class="tab-content">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Authentication Type</mat-label>
              <mat-select [(ngModel)]="endpoint.auth.type" (selectionChange)="save()">
                <mat-option *ngFor="let type of authTypes" [value]="type">{{ type }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <ng-container [ngSwitch]="endpoint.auth.type">
              <div *ngSwitchCase="'bearer'" class="auth-fields">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Bearer Token</mat-label>
                  <input matInput [(ngModel)]="endpoint.auth.token" (ngModelChange)="save()">
                </mat-form-field>
              </div>
              
              <div *ngSwitchCase="'basic'" class="auth-fields">
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput [(ngModel)]="endpoint.auth.username" (ngModelChange)="save()">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" [(ngModel)]="endpoint.auth.password" (ngModelChange)="save()">
                </mat-form-field>
              </div>
              
              <div *ngSwitchCase="'apiKey'" class="auth-fields">
                <mat-form-field appearance="outline">
                  <mat-label>API Key Name</mat-label>
                  <input matInput [(ngModel)]="endpoint.auth.apiKeyName" (ngModelChange)="save()">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>API Key Value</mat-label>
                  <input matInput [(ngModel)]="endpoint.auth.apiKeyValue" (ngModelChange)="save()">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Location</mat-label>
                  <mat-select [(ngModel)]="endpoint.auth.apiKeyLocation" (selectionChange)="save()">
                    <mat-option value="header">Header</mat-option>
                    <mat-option value="query">Query</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </ng-container>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
    
    <ng-template #noSelection>
      <div class="no-selection">
        <mat-icon>touch_app</mat-icon>
        <p>Select an endpoint to configure</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .config-panel {
      height: 100%;
      background: white;
      border-left: 1px solid #ddd;
      overflow-y: auto;
    }
    
    .panel-header {
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }
    
    .method-badge {
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 12px;
      color: white;
    }
    
    .method-badge.get { background: #61affe; }
    .method-badge.post { background: #49cc90; }
    .method-badge.put { background: #fca130; }
    .method-badge.delete { background: #f93e3e; }
    .method-badge.patch { background: #50e3c2; }
    
    .path-field {
      flex: 1;
    }
    
    .tab-content {
      padding: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .param-form, .response-form, .auth-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px 0;
    }
    
    .param-name {
      font-weight: 500;
      margin-right: 8px;
    }
    
    .param-location {
      font-size: 11px;
      background: #eee;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .status-code {
      font-family: 'Roboto Mono', monospace;
      font-weight: 700;
      margin-right: 8px;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .status-code.success { background: #49cc90; color: white; }
    .status-code.redirect { background: #fca130; color: white; }
    .status-code.client-error { background: #f93e3e; color: white; }
    .status-code.server-error { background: #9c27b0; color: white; }
    
    .code-input {
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
    }
    
    .empty-hint {
      text-align: center;
      color: #999;
      padding: 24px;
    }
    
    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }
    
    .no-selection mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
  `]
})
export class ConfigPanelComponent implements OnInit, OnDestroy {
  endpoint: Endpoint | null = null;
  private subscription?: Subscription;

  paramLocations: ParameterLocation[] = ['query', 'path', 'header', 'body'];
  paramTypes: ParameterType[] = ['string', 'number', 'boolean', 'object', 'array'];
  authTypes: AuthType[] = ['none', 'bearer', 'basic', 'apiKey'];
  statusCodes = [200, 201, 204, 301, 302, 400, 401, 403, 404, 405, 422, 500, 502, 503];

  constructor(private apiBuilder: ApiBuilderService) {}

  ngOnInit(): void {
    this.subscription = this.apiBuilder.selectedEndpoint$.subscribe(endpoint => {
      this.endpoint = endpoint;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get hasRequestBody(): boolean {
    return this.endpoint?.method === 'POST' || 
           this.endpoint?.method === 'PUT' || 
           this.endpoint?.method === 'PATCH';
  }

  save(): void {
    if (this.endpoint) {
      this.apiBuilder.updateEndpoint(this.endpoint);
    }
  }

  addParameter(): void {
    if (this.endpoint) {
      const param: Parameter = {
        id: uuidv4(),
        name: '',
        type: 'string',
        location: 'query',
        required: false
      };
      this.endpoint.parameters = [...this.endpoint.parameters, param];
      this.save();
    }
  }

  removeParameter(index: number): void {
    if (this.endpoint) {
      this.endpoint.parameters = this.endpoint.parameters.filter((_, i) => i !== index);
      this.save();
    }
  }

  addResponse(): void {
    if (this.endpoint) {
      const response: ApiResponse = {
        statusCode: 200,
        description: ''
      };
      this.endpoint.responses = [...this.endpoint.responses, response];
      this.save();
    }
  }

  removeResponse(index: number): void {
    if (this.endpoint) {
      this.endpoint.responses = this.endpoint.responses.filter((_, i) => i !== index);
      this.save();
    }
  }

  getStatusClass(code: number): string {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'redirect';
    if (code >= 400 && code < 500) return 'client-error';
    return 'server-error';
  }
}
