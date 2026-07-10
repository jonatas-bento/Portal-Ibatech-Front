import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component'; // Ajuste o nome da classe se necessário

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastComponent, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner />
    <app-toast />

    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #090909;
      color: #F0F2F5;

      font-family: 'Inter', sans-serif; /* Ou sua fonte padrão */
    }
  `],
})
export class AppComponent {}