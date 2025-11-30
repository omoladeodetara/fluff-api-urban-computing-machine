import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MethodToolbarComponent } from './components/method-toolbar/method-toolbar.component';
import { ApiCanvasComponent } from './components/api-canvas/api-canvas.component';
import { ConfigPanelComponent } from './components/config-panel/config-panel.component';
import { ApiTesterComponent } from './components/api-tester/api-tester.component';
import { ApiBuilderService } from './services/api-builder.service';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MethodToolbarComponent,
    ApiCanvasComponent,
    ConfigPanelComponent,
    ApiTesterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Visual API Designer';
  baseUrl = 'http://localhost:3000';
  apiTitle = 'My API';

  constructor(
    private apiBuilder: ApiBuilderService,
    private exportService: ExportService,
    private snackBar: MatSnackBar
  ) {
    this.baseUrl = this.apiBuilder.getBaseUrl();
  }

  onBaseUrlChange(): void {
    this.apiBuilder.setBaseUrl(this.baseUrl);
  }

  exportOpenAPI(): void {
    const endpoints = this.apiBuilder.getEndpoints();
    if (endpoints.length === 0) {
      this.snackBar.open('No endpoints to export', 'Close', { duration: 3000 });
      return;
    }
    const spec = this.exportService.exportToOpenAPI(endpoints, this.apiTitle, this.baseUrl);
    this.exportService.downloadSpec(spec, 'api-spec.json');
    this.snackBar.open('OpenAPI spec exported successfully', 'Close', { duration: 3000 });
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all endpoints?')) {
      this.apiBuilder.clearAll();
      this.snackBar.open('All endpoints cleared', 'Close', { duration: 3000 });
    }
  }
}
