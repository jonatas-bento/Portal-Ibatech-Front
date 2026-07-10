import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [ngClass]="'toast--' + t.type" role="alert">
  <span class="toast__msg">{{ t.message }}</span>
  <button class="toast__close" (click)="toastService.dismiss(t.id)" aria-label="Fechar">×</button>
</div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 10000; max-width: 380px; }
    .toast {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      padding: 12px 16px; border-radius: var(--radius-md); background: var(--ib-surface-2);
      border: 1px solid var(--ib-border); box-shadow: var(--shadow-md); animation: slideIn 0.2s ease both;
    }
    .toast--success { border-left: 4px solid var(--ib-success); color: var(--ib-success); }
    .toast--error { border-left: 4px solid var(--ib-danger); color: var(--ib-danger); }
    .toast--warning { border-left: 4px solid var(--ib-warning); color: var(--ib-warning); }
    .toast--info { border-left: 4px solid var(--ib-blue); color: var(--ib-blue); }
    .toast__msg { font-size: 14px; font-weight: 500; }
    .toast__close { background: none; border: none; color: var(--ib-text-muted); cursor: pointer; font-size: 18px; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}