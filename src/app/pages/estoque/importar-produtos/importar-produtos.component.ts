import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { EstoqueService } from 'src/app/services/estoque.service';
import { ProdutoImportacaoResultado, ProdutoImportacaoErro } from 'src/app/core/models/produto.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-importar-produtos',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './importar-produtos.component.html',
  styleUrls: ['./importar-produtos.component.scss']
})
export class ImportarProdutosComponent {
  private readonly estoqueService = inject(EstoqueService);
  private readonly dialogRef = inject(MatDialogRef<ImportarProdutosComponent>);

  arquivoSelecionado = signal<File | null>(null);
  importando = signal<boolean>(false);
  resultado = signal<ProdutoImportacaoResultado | null>(null);
  erros = signal<ProdutoImportacaoErro[]>([]);
  
  displayedColumns: string[] = ['linha', 'campo', 'valor', 'mensagem'];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.arquivoSelecionado.set(input.files[0]);
      this.resultado.set(null);
      this.erros.set([]);
    }
  }

  removerArquivo(): void {
    this.arquivoSelecionado.set(null);
    this.resultado.set(null);
    this.erros.set([]);
  }

  importar(): void {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) return;

    this.importando.set(true);
    this.estoqueService.importarProdutos(arquivo).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.erros.set(res.erros || []);
        this.importando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 && err.error) {
          this.resultado.set(err.error);
          this.erros.set(err.error.erros || []);
        }
        this.importando.set(false);
      }
    });
  }

  fechar(): void {
    const res = this.resultado();
    this.dialogRef.close({ atualizarLista: res && res.produtosImportados > 0 });
  }
}
