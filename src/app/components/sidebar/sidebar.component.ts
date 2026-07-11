import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajustado o caminho relativo baseado na sua árvore
import { getRoleLabel } from '../../core/utils/role.helper';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss' // Usando styleUrl no singular (padrão do Angular 17+)
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly getRoleLabel = getRoleLabel;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}