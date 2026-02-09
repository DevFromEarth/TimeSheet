import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="loader-container">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>
    }
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 16px;
      min-height: 200px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  `]
})
export class LoaderComponent {
  @Input() isLoading = false;
  @Input() loadingMessage = 'Loading...';
}
