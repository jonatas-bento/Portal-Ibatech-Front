import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatChipsModule
} from '@angular/material/chips';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  ImportarCompraComponent
} from '../importar-compra/importar-compra.component';

import {
  EntradaCompraResumo,
  StatusEntradaCompra
} from '../../../core/models/entrada-compra.model';

import {
  EntradaCompraService
} from '../../../services/entrada-compra.service';

@Component({
  selector: 'app-lista-compras',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,

    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],

  templateUrl:
    './lista-compras.component.html',

  styleUrl:
    './lista-compras.component.scss'
})
export class ListaComprasComponent
  implements OnInit {

  entradas: EntradaCompraResumo[] = [];
  entradasFiltradas: EntradaCompraResumo[] = [];

  loading = false;

  filtroTexto = '';
  filtroStatus: '' | StatusEntradaCompra = '';

  constructor(
    private readonly service:
      EntradaCompraService,

    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;

    this.service.listar().subscribe({
      next: data => {
        this.entradas = data;
        this.aplicarFiltros();
        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    const texto =
      this.filtroTexto
        .trim()
        .toLowerCase();

    this.entradasFiltradas =
      this.entradas.filter(
        entrada => {

          const correspondeTexto =
            !texto ||
            entrada.numeroDocumento
              .toLowerCase()
              .includes(texto) ||
            entrada.fornecedorNome
              .toLowerCase()
              .includes(texto);

          const correspondeStatus =
            !this.filtroStatus ||
            entrada.status ===
              this.filtroStatus;

          return (
            correspondeTexto &&
            correspondeStatus
          );
        }
      );
  }

  limparFiltros(): void {
    this.filtroTexto = '';
    this.filtroStatus = '';

    this.aplicarFiltros();
  }

  novaEntrada(): void {
    this.router.navigate([
      '/dashboard/compras/nova'
    ]);
  }

  importarCompra(): void {
    const dialogRef =
      this.dialog.open(
        ImportarCompraComponent,
        {
          width: '760px',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          panelClass: 'ib-importar-compra-dialog'
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (
          result?.importado &&
          !result?.entradaCompraId
        ) {
          this.carregar();
        }
      });
  }

  statusLabel(
    status: StatusEntradaCompra
  ): string {

    switch (status) {
      case 'Rascunho':
        return 'Rascunho';

      case 'Confirmada':
        return 'Confirmada';

      case 'Cancelada':
        return 'Cancelada';

      default:
        return status;
    }
  }
}
