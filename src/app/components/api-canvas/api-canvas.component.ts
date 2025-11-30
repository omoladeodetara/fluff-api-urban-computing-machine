import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { ApiBuilderService } from '../../services/api-builder.service';
import { EndpointBlockComponent } from '../endpoint-block/endpoint-block.component';
import { Endpoint, HttpMethod } from '../../models';

@Component({
  selector: 'app-api-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, EndpointBlockComponent],
  template: `
    <div class="canvas-container">
      <div class="canvas" 
           id="canvas"
           cdkDropList
           [cdkDropListData]="endpoints"
           (cdkDropListDropped)="onDrop($event)">
        <div *ngIf="endpoints.length === 0" class="empty-state">
          <mat-icon>api</mat-icon>
          <p>Drag HTTP methods here to create endpoints</p>
        </div>
        <div *ngFor="let endpoint of endpoints" 
             class="endpoint-wrapper"
             cdkDrag
             [cdkDragData]="endpoint"
             [style.left.px]="endpoint.position.x"
             [style.top.px]="endpoint.position.y"
             (cdkDragEnded)="onDragEnded($event, endpoint)">
          <app-endpoint-block 
            [endpoint]="endpoint"
            [selected]="selectedEndpoint?.id === endpoint.id"
            (select)="selectEndpoint(endpoint)"
            (delete)="deleteEndpoint(endpoint)">
          </app-endpoint-block>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      flex: 1;
      overflow: auto;
      background: #fafafa;
      position: relative;
    }
    
    .canvas {
      min-width: 100%;
      min-height: 100%;
      position: relative;
      background-image: 
        linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    
    .empty-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #999;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    
    .empty-state p {
      font-size: 16px;
    }
    
    .endpoint-wrapper {
      position: absolute;
      cursor: move;
    }
    
    .endpoint-wrapper.cdk-drag-preview {
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    
    .endpoint-wrapper.cdk-drag-placeholder {
      opacity: 0.3;
    }
    
    .cdk-drop-list-dragging .endpoint-wrapper:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class ApiCanvasComponent implements OnInit {
  endpoints: Endpoint[] = [];
  selectedEndpoint: Endpoint | null = null;

  constructor(private apiBuilder: ApiBuilderService) {}

  ngOnInit(): void {
    this.apiBuilder.endpoints$.subscribe(endpoints => {
      this.endpoints = endpoints;
    });
    
    this.apiBuilder.selectedEndpoint$.subscribe(endpoint => {
      this.selectedEndpoint = endpoint;
    });
  }

  onDrop(event: CdkDragDrop<Endpoint[], HttpMethod[], HttpMethod>): void {
    // If dropping from method toolbar (external) - check by element id
    if (event.previousContainer.id !== event.container.id) {
      const method = event.item.data;
      const rect = (event.container.element.nativeElement as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.dropPoint.x - rect.left,
        y: event.dropPoint.y - rect.top
      };
      const endpoint = this.apiBuilder.createEndpoint(method, position);
      this.apiBuilder.selectEndpoint(endpoint);
    }
  }

  onDragEnded(event: CdkDragEnd, endpoint: Endpoint): void {
    const position = event.source.getFreeDragPosition();
    const updated = {
      ...endpoint,
      position: {
        x: endpoint.position.x + position.x,
        y: endpoint.position.y + position.y
      }
    };
    this.apiBuilder.updateEndpoint(updated);
    // Reset the drag position after updating the endpoint's stored position
    event.source.reset();
  }

  selectEndpoint(endpoint: Endpoint): void {
    this.apiBuilder.selectEndpoint(endpoint);
  }

  deleteEndpoint(endpoint: Endpoint): void {
    this.apiBuilder.deleteEndpoint(endpoint.id);
  }
}
