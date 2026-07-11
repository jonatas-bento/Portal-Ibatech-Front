import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioResumo, RoleUsuario } from '../../../core/models/usuario.model';
import { getRoleLabel, ROLE_OPTIONS } from '../../../core/utils/role.helper';
import { ToastService } from '../../../services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { NovoUsuarioDialogComponent } from '../novo-usuario-dialog/novo-usuario-dialog.component';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly usuarios = signal<UsuarioResumo[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly erroMsg = signal<string | null>(null);

  // Filtros
  filtroNome = signal<string>('');
  filtroRole = signal<RoleUsuario | ''>('');
  filtroAtivo = signal<boolean | undefined>(undefined);

  readonly roleOptions = ROLE_OPTIONS;

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.erroMsg.set(null);

    const filtros = {
      nome: this.filtroNome() || undefined,
      role: this.filtroRole() || undefined,
      ativo: this.filtroAtivo()
    };

    this.usuarioService.listar(filtros).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.carregando.set(false);
      },
      error: () => {
        this.erroMsg.set('Não foi possível carregar os usuários.');
        this.toast.error('Não foi possível carregar os usuários.');
        this.carregando.set(false);
      }
    });
  }

  limparFiltros(): void {
    this.filtroNome.set('');
    this.filtroRole.set('');
    this.filtroAtivo.set(undefined);
    this.carregarUsuarios();
  }

  getRoleLabel(role: RoleUsuario): string {
    return getRoleLabel(role);
  }

  abrirNovoUsuario(): void {
    this.dialog.open(NovoUsuarioDialogComponent, {
      width: '500px'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.carregarUsuarios();
      }
    });
  }
}
