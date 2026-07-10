import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho se necessário

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  usuarioNome: string = 'Administrador'; // Você pode puxar isso do seu AuthService depois

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout(); // Certifique-se de que seu serviço limpa o token/storage
    this.router.navigate(['/login']);
  }
}