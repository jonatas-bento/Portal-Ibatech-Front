import { ProdutoCreateRequest, TipoProduto } from './../../../core/models/produto.model';
// src/app/pages/estoque/novo-produto/novo-produto.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstoqueService } from 'src/app/services/estoque.service';


@Component({
  selector: 'app-novo-produto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './novo-produto.component.html',
  styleUrl: './novo-produto.component.scss'
})
export class NovoProdutoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly estoqueService = inject(EstoqueService);

  form!: FormGroup;
  readonly salvando = signal<boolean>(false);

  // Mapeamento das chaves exatas do seu TipoProduto para exibição amigável no HTML
  readonly categorias = [
    { value: 'Computador', label: 'Computador / Servidor' },
    { value: 'Peca', label: 'Peça / Hardware' },
    { value: 'AcessorioMovel', label: 'Acessório Móvel' },
    { value: 'Periferico', label: 'Periférico / Conectividade' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      codigoSku: [''], 
      categoria: ['', Validators.required],
      precoCusto: [''], // Usado temporariamente para a máscara de tela
      estoqueInicial: [0, [Validators.required, Validators.min(0)]],
      quantidadeMinima: [1, [Validators.required, Validators.min(0)]],
      especificacoes: [''],
      marca: [''],
      modelo: ['']
    });

    // Escuta ativa para formatação de moeda R$
    this.form.get('precoCusto')?.valueChanges.subscribe(valor => {
      if (valor) {
        const apenasNumeros = valor.replace(/\D/g, '');
        const valorFormatado = this.formatarMoeda(apenasNumeros);
        this.form.get('precoCusto')?.setValue(valorFormatado, { emitEvent: false });
      }
    });
  }

  private formatarMoeda(valor: string): string {
    if (!valor) return '';
    const num = (parseInt(valor, 10) / 100).toFixed(2);
    return 'R$ ' + num
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  }

  private obterPrecoLimpo(): number {
    const valor = this.form.get('precoCusto')?.value;
    if (!valor) return 0;
    return parseFloat(valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
  }

  cadastrar(): void {
    if (this.form.invalid || this.salvando()) return;

    this.salvando.set(true);
    const precoLimpo = this.obterPrecoLimpo();

    // PAYLOAD INTEGRADO À SUA INTERFACE PRODUTOCREATEREQUEST
    const payload: ProdutoCreateRequest = {
      nome: this.form.value.nome,
      tipo: this.form.value.categoria as TipoProduto, // Type cast para o literal estrito
      precoCompra: precoLimpo, // Mapeado do preço de custo digitado
      precoVenda: precoLimpo,  // Inicializa igual ao de compra para o back aceitar
      quantidadeInicial: this.form.value.estoqueInicial,
      quantidadeMinima: this.form.value.quantidadeMinima,
      descricao: this.form.value.especificacoes,
      codigoSku: this.form.value.codigoSku || undefined,
      marca: this.form.value.marca || undefined,
      modelo: this.form.value.modelo || undefined
    };

    this.estoqueService.cadastrar(payload).subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/dashboard/estoque']);
      },
      error: (err) => {
        console.error('Falha ao registrar ativo:', err);
        this.salvando.set(false);
      }
    });
  }

  voltar(): void {
    this.location.back();
  }

  temErro(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}