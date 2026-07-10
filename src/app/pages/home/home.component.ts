// src/app/pages/home/home.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Servico {
  icone:     string;
  titulo:    string;
  descricao: string;
  badge?:    string;
  destaque?: boolean;
}

interface Stat {
  valor: string;
  label: string;
}

@Component({
  selector:        'app-home',
  standalone:       true,
  imports:         [CommonModule, RouterModule],
  templateUrl:     './home.component.html',
  styleUrls:       ['./home.component.scss'],
  changeDetection:  ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, AfterViewInit {
  readonly ano = new Date().getFullYear();

  readonly stats: Stat[] = [
    { valor: '500+', label: 'Projetos entregues'      },
    { valor: '98%',  label: 'Satisfação dos clientes' },
    { valor: '12+',  label: 'Anos no mercado'         },
    { valor: '50+',  label: 'Especialistas técnicos'  },
  ];

  readonly servicos: Servico[] = [
    {
      icone:    'hardware',
      titulo:   'Venda de Hardware',
      descricao:'Computadores, peças e acessórios selecionados com rastreabilidade de estoque, garantia e suporte pós-venda direto com nossa equipe técnica.',
    },
    {
      icone:    'tools',
      titulo:   'Assistência Técnica',
      descricao:'Diagnóstico preciso, reparo certificado e manutenção preventiva para desktops, notebooks e dispositivos móveis corporativos.',
    },
    {
      icone:    'transformation',
      titulo:   'Transformação Digital',
      descricao:'Nosso carro-chefe. Arquitetamos e implementamos projetos B2B de ponta a ponta: da análise de requisitos à entrega em produção, com foco em escala, segurança e ROI mensurável.',
      badge:    'Principal',
      destaque:  true,
    },
  ];

  readonly etapas = [
    {
      num:   '01',
      titulo:'Análise de Requisitos',
      desc:  'Formulário digital com levantamento completo das dores, infraestrutura atual e volumetria.',
    },
    {
      num:   '02',
      titulo:'Proposta Técnica',
      desc:  'Elaboração de escopo, arquitetura e cronograma detalhado com estimativa de ROI.',
    },
    {
      num:   '03',
      titulo:'Desenvolvimento',
      desc:  'Sprint ágil com entregas parciais, revisão técnica e validação contínua pelo cliente.',
    },
    {
      num:   '04',
      titulo:'Deploy e Suporte',
      desc:  'Implantação em ambiente de produção com monitoramento ativo e SLA contratado.',
    },
  ];

  menuAberto = signal(false);

  // Guarda a referência para cleanup
  private _observer?: IntersectionObserver;

  ngOnInit(): void {
    // Nada que dependa do DOM aqui — apenas estado
  }

  // IntersectionObserver APENAS no AfterViewInit (DOM garantido)
  ngAfterViewInit(): void {
    // Verifica suporte antes de usar
    if (typeof IntersectionObserver === 'undefined') {
      // SSR ou ambiente sem suporte: revela tudo imediatamente
      document
        .querySelectorAll<HTMLElement>('.reveal')
        .forEach(el => el.classList.add('visible'));
      return;
    }

    this._observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            this._observer?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    // Pequeno delay para garantir que o Angular terminou de renderizar
    setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('.reveal')
        .forEach(el => this._observer?.observe(el));
    }, 50);
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
  }

  toggleMenu(): void {
    this.menuAberto.update(v => !v);
  }
}