// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule, RouterOutlet, RouterLinkActive,
         RouterLink }    from '@angular/router';
import { AuthService }   from '../../services/auth.service';
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';

@Component({
  selector:    'app-dashboard',
  standalone:   true,
  imports:     [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    SidebarComponent,
    NavbarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  readonly role = this.auth.currentRole;
  readonly nome = this.auth.currentNome;
}