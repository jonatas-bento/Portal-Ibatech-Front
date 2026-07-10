// src/app/pages/dashboard/overview/overview.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjetoService } from 'src/app/services/projeto.service';

interface MetricCard {
  title: string;
  value: string | number;
  desc: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  private readonly projetoService = inject(ProjetoService);

  // Signals para controle de estado limpo e performático
  readonly metrics = signal<MetricCard[]>([]);
  readonly ultimosProjetos = signal<any[]>([]);

  ngOnInit(): void {
    this.carregarDadosPainel();
  }

  private carregarDadosPainel(): void {
    // Buscando dados reais do seu repositório para popular os últimos projetos
    this.projetoService.listarMeus().subscribe({
      next: (projetos) => {
        this.ultimosProjetos.set(projetos.slice(0, 3)); // Pega apenas os 3 mais recentes
        
        // Mapeando os KPIs dinamicamente com base no banco
        const total = projetos.length;
        const aguardandoAnalisar = projetos.filter((p: any) => p.status === 'RECEBIDO' || p.status === null).length;
        
        this.metrics.set([
          { 
            title: 'Demandas Totais', 
            value: total, 
            desc: 'Propostas registradas', 
            icon: 'folder', 
            colorClass: 'card-kpi--blue' 
          },
          { 
            title: 'Análises Pendentes', 
            value: aguardandoAnalisar, 
            desc: 'Aguardando diagnóstico', 
            icon: 'clock', 
            colorClass: 'card-kpi--gold' 
          },
          { 
            title: 'SLA de Resposta', 
            value: '48h', 
            desc: 'Tempo médio de retorno', 
            icon: 'zap', 
            colorClass: 'card-kpi--cyan' 
          }
        ]);
      },
      error: () => {
        // Fallback caso o banco esteja fora durante o desenvolvimento
        this.metrics.set([
          { title: 'Demandas Totais', value: 0, desc: '--', icon: 'folder', colorClass: 'card-kpi--blue' }
        ]);
      }

  })
}
}