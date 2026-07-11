import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { AlterarMinhaSenhaDialogComponent } from '../../pages/usuarios/alterar-minha-senha-dialog/alterar-minha-senha-dialog.component';
import { getRoleLabel } from '../../core/utils/role.helper';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly usuarioNome = this.authService.currentNome;
  readonly usuarioRole = this.authService.currentRole;

  get roleLabel(): string {
    const role = this.usuarioRole();
    return role ? getRoleLabel(role) : '';
  }

  abrirAlterarSenha() {
    this.dialog.open(AlterarMinhaSenhaDialogComponent, {
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      panelClass: 'ibatech-user-dialog',
      autoFocus: false,
      restoreFocus: true
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
