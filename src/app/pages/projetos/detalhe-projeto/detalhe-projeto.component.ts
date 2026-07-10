// src/app/pages/projetos/detalhe-projeto/detalhe-projeto.component.ts
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjetoService } from '../../../services/projeto.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { 
  ProjetoResponse, 
  StatusProjeto, 
  TRANSICOES_VALIDAS, 
  STATUS_LABELS,
  STATUS_BADGE_CLASS 
} from '../../../core/models/projeto.model'; // Corrigido para .model no singular se for o seu caso

@Component({
  selector: 'app-detalhe-projeto',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detalhe-projeto.component.html',
  styleUrl: './detalhe-projeto.component.scss'
})
export class DetalheProjetoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projetoService = inject(ProjetoService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly projeto = signal<ProjetoResponse | null>(null);
  readonly carregando = signal(true);
  readonly salvandoStatus = signal(false);

  // Armazena o status selecionado e a nota do analista (opcional)
  statusSelecionado = signal<StatusProjeto>('Recebido');
  notaAnalistaInput = '';

  // Atalhos reativos para os dicionários da sua interface
  readonly labels = STATUS_LABELS;
  readonly badgeClasses = STATUS_BADGE_CLASS;

  // Filtra as opções de status liberadas com base no estado atual do projeto
  readonly opcoesStatusDisponiveis = computed(() => {
    const proj = this.projeto();
    if (!proj) return [];
    
    const statusAtual = proj.status || 'Recebido';
    return TRANSICOES_VALIDAS[statusAtual] || [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarProjeto(id);
    }
  }

  normalizarStatus(status: string | null | undefined): StatusProjeto {
  if (!status) return 'RECEBIDO' as StatusProjeto; // ou o nome correto do enum para recebido
  
  const chaveNormalizada = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '_');

  // Fazemos o cast aqui para acalmar o compilador do TypeScript
  return chaveNormalizada as StatusProjeto;
}

  private carregarProjeto(id: string): void {
    this.carregando.set(true);
    this.projetoService.obterPorId(id).subscribe({
      next: (res) => {
        this.projeto.set(res);
        this.statusSelecionado.set(res.status || 'Recebido');
        this.notaAnalistaInput = res.notaAnalista || '';
        this.carregando.set(false);
      },
      error: () => {
        this.toast.error('Erro ao carregar os detalhes do projeto.');
        this.carregando.set(false);
      }
    });
  }

  alterarStatus(): void {
    const proj = this.projeto();
    if (!proj || this.salvandoStatus()) return;

    this.salvandoStatus.set(true);

    // Ajustado exatamente ao seu DTO: novoStatus + notaAnalista opcional
    const payload = {
      novoStatus: this.statusSelecionado(),
      notaAnalista: this.notaAnalistaInput || undefined
    };

    this.projetoService.atualizarStatus(proj.id, payload).subscribe({
      next: (atualizado) => {
        this.projeto.set(atualizado);
        this.toast.success(`Status atualizado para: ${STATUS_LABELS[this.statusSelecionado()]}`);
        this.salvandoStatus.set(false);
      },
      error: () => {
        this.salvandoStatus.set(false);
      }
    });
  }

  formatarVolume(v: number): string {
    if (!v) return 'Não informado';
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M usuários`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K usuários`;
    return `${v} usuários`;
  }
}