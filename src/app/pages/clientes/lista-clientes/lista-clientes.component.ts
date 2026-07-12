import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, finalize } from 'rxjs/operators';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteResumo } from '../../../core/models/cliente.model';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';
import { NovoClienteDialogComponent } from '../novo-cliente-dialog/novo-cliente-dialog.component';
import { EditarClienteDialogComponent } from '../editar-cliente-dialog/editar-cliente-dialog.component';
import { ConfirmarStatusClienteDialogComponent } from '../confirmar-status-cliente-dialog/confirmar-status-cliente-dialog.component';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css']
})
export class ListaClientesComponent implements OnInit {
  clientes: ClienteResumo[] = [];
  filtros = {
    texto: '',
    ativo: undefined as boolean | undefined
  };
  loading = false;
  clienteCarregandoId: string | null = null;
  clienteAlterandoStatusId: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.clienteService.listar(this.filtros).subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: () => {
        this.toastService.error('Não foi possível carregar os clientes.');
      }
    });
  }

  filtrar(): void {
    this.carregarClientes();
  }

  limparFiltros(): void {
    this.filtros = { texto: '', ativo: undefined };
    this.carregarClientes();
  }

  abrirNovoCliente(): void {
    this.dialog.open(NovoClienteDialogComponent, {
      panelClass: 'ibatech-user-dialog',
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      autoFocus: false,
      restoreFocus: true
    }).afterClosed().subscribe(result => {
      if (result) {
        this.carregarClientes();
      }
    });
  }

  abrirEditarCliente(cliente: ClienteResumo): void {
    this.clienteCarregandoId = cliente.id;
    this.clienteService.obterPorId(cliente.id).subscribe({
      next: (clienteCompleto) => {
        this.clienteCarregandoId = null;
        this.dialog.open(EditarClienteDialogComponent, {
          panelClass: 'ibatech-user-dialog',
          width: '560px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 32px)',
          autoFocus: false,
          restoreFocus: true,
          data: { cliente: clienteCompleto }
        }).afterClosed().subscribe(result => {
          if (result) {
            this.carregarClientes();
          }
        });
      },
      error: () => {
        this.clienteCarregandoId = null;
        this.toastService.error('Não foi possível carregar os dados do cliente.');
      }
    });
  }

  abrirConfirmarStatus(cliente: ClienteResumo): void {
    this.dialog.open(ConfirmarStatusClienteDialogComponent, {
      panelClass: 'ibatech-user-dialog',
      width: '400px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: false,
      restoreFocus: true,
      data: { cliente }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.clienteAlterandoStatusId = cliente.id;
        const novoStatus = !cliente.ativo;

        this.clienteService.alterarStatus(cliente.id, { ativo: novoStatus })
          .pipe(
            switchMap(() => this.clienteService.listar(this.filtros)),
            finalize(() => {
              this.clienteAlterandoStatusId = null;
            })
          )
          .subscribe({
            next: clientes => {
              this.clientes = clientes;
            },
            error: () => {
              this.toastService.error('Não foi possível atualizar a lista de clientes.');
            }
          });
      }
    });
  }
}
