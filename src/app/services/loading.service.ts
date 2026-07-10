// src/app/services/loading.service.ts
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _contador = signal(0);

  // Conta requisições simultâneas para evitar flicker no finalize
  readonly isLoading = computed(() => this._contador() > 0);

  show(): void { this._contador.update(n => n + 1); }
  hide(): void { this._contador.update(n => Math.max(0, n - 1)); }
}