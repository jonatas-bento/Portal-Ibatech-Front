// src/app/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:      number;
  message: string;
  type:    ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _seq    = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void { this.push(message, 'success'); }
  error  (message: string): void { this.push(message, 'error');   }
  warning(message: string): void { this.push(message, 'warning'); }
  info   (message: string): void { this.push(message, 'info');    }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(message: string, type: ToastType): void {
    const id = ++this._seq;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}