import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Endpoint } from '../../models';

@Component({
  selector: 'app-endpoint-block',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <mat-card class="endpoint-block" 
              [class]="endpoint.method.toLowerCase()"
              [class.selected]="selected"
              (click)="onSelect()">
      <div class="endpoint-header">
        <span class="method-badge" [class]="endpoint.method.toLowerCase()">
          {{ endpoint.method }}
        </span>
        <button mat-icon-button class="delete-btn" 
                (click)="onDelete($event)" 
                matTooltip="Delete endpoint">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="endpoint-path">{{ endpoint.path }}</div>
      <div class="endpoint-summary" *ngIf="endpoint.summary">
        {{ endpoint.summary }}
      </div>
      <div class="endpoint-info">
        <span *ngIf="endpoint.parameters.length" class="info-badge">
          <mat-icon>tune</mat-icon> {{ endpoint.parameters.length }}
        </span>
        <span *ngIf="endpoint.auth.type !== 'none'" class="info-badge auth">
          <mat-icon>lock</mat-icon>
        </span>
      </div>
    </mat-card>
  `,
  styles: [`
    .endpoint-block {
      width: 200px;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 4px solid transparent;
    }
    
    .endpoint-block:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .endpoint-block.selected {
      border-left-color: #3f51b5;
      box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
    }
    
    .endpoint-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
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
    
    .delete-btn {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    
    .delete-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .endpoint-path {
      font-family: 'Roboto Mono', monospace;
      font-size: 13px;
      color: #333;
      word-break: break-all;
      margin-bottom: 4px;
    }
    
    .endpoint-summary {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .endpoint-info {
      display: flex;
      gap: 8px;
    }
    
    .info-badge {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 11px;
      color: #666;
    }
    
    .info-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .info-badge.auth mat-icon {
      color: #fca130;
    }
  `]
})
export class EndpointBlockComponent {
  @Input() endpoint!: Endpoint;
  @Input() selected = false;
  @Output() select = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onSelect(): void {
    this.select.emit();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }
}
