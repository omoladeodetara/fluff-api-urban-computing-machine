import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpMethod } from '../../models';

@Component({
  selector: 'app-method-toolbar',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="method-toolbar">
      <h3>HTTP Methods</h3>
      <p class="hint">Drag methods to canvas</p>
      <!-- NOTE: The value 'canvas' in cdkDropListConnectedTo must match the id of the canvas element.
           If you change the canvas id, update this array as well to avoid breaking drag-drop. -->
      <div class="method-list" cdkDropList [cdkDropListConnectedTo]="['canvas']" 
           [cdkDropListData]="methods" cdkDropListSortingDisabled>
        <div *ngFor="let method of methods" 
             class="method-item" 
             [class]="method.toLowerCase()"
             cdkDrag
             [cdkDragData]="method"
             matTooltip="Drag to canvas">
          <mat-icon>{{ getIcon(method) }}</mat-icon>
          <span>{{ method }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .method-toolbar {
      padding: 16px;
      height: 100%;
      background: #f5f5f5;
      border-right: 1px solid #ddd;
    }
    
    h3 {
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .hint {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }
    
    .method-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .method-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: grab;
      color: white;
      font-weight: 500;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .method-item:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .method-item.cdk-drag-placeholder {
      opacity: 0.5;
    }
    
    .method-item.cdk-drag-preview {
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    }
    
    .get { background: linear-gradient(135deg, #61affe, #4a9ade); }
    .post { background: linear-gradient(135deg, #49cc90, #3bb57d); }
    .put { background: linear-gradient(135deg, #fca130, #e89520); }
    .delete { background: linear-gradient(135deg, #f93e3e, #d93232); }
    .patch { background: linear-gradient(135deg, #50e3c2, #40c9ab); }
  `]
})
export class MethodToolbarComponent {
  methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  getIcon(method: HttpMethod): string {
    const icons: Record<HttpMethod, string> = {
      'GET': 'download',
      'POST': 'add_circle',
      'PUT': 'edit',
      'DELETE': 'delete',
      'PATCH': 'build'
    };
    return icons[method];
  }
}
