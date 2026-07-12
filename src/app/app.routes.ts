// src/app/app.routes.ts
import { Routes }      from '@angular/router';
import { authGuard }   from './core/guards/auth.guard';
import { roleGuard }   from './core/guards/role.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path:  '',
    loadComponent: () =>
      import('./pages/home/home.component')
        .then(m => m.HomeComponent),
    title: 'IBATECH — Soluções Digitais',
  },
  {
    path:        'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent),
    title: 'Entrar — IBATECH',
  },
  {
    path:        'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    children: [
      {
        path:      '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard/overview/overview.component')
            .then(m => m.OverviewComponent),
        title: 'Painel — IBATECH',
      },
      {
        path: 'projetos',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/projetos/projetos-lista/projetos-lista.component')
                .then(m => m.ProjetosListaComponent),
            title: 'Projetos — IBATECH',
          },
          {
            path: 'novo',
            loadComponent: () =>
              import('./pages/projetos/novo-projeto/novo-projeto.component')
                .then(m => m.NovoProjetoComponent),
            title: 'Novo Projeto — IBATECH',
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/projetos/detalhe-projeto/detalhe-projeto.component')
                .then(m => m.DetalheProjetoComponent),
            title: 'Detalhes do Projeto — IBATECH',
          },
        ],
      },
      {
        path:        'estoque',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Funcionario'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/estoque/lista-produtos/lista-produtos.component')
                .then(m => m.ListaProdutosComponent),
            title: 'Estoque — IBATECH',
          },
          {
            path: 'novo',
            loadComponent: () =>
              import('./pages/estoque/novo-produto/novo-produto.component')
                .then(m => m.NovoProdutoComponent),
            title: 'Novo Produto — IBATECH',
          },
        ],
      },
      {
        path:        'financeiro',
        canActivate: [roleGuard],
        data:        { roles: ['Admin'] },
        loadComponent: () =>
          import('./pages/financeiro/painel-financeiro/painel-financeiro.component')
            .then(m => m.PainelFinanceiroComponent),
        title: 'Financeiro — IBATECH',
      },
      {
        path:        'usuarios',
        canActivate: [roleGuard],
        data:        { roles: ['Admin'] },
        loadComponent: () =>
          import('./pages/usuarios/lista-usuarios/lista-usuarios.component')
            .then(m => m.ListaUsuariosComponent),
        title: 'Usuários — IBATECH',
      },
      {
        path:        'clientes',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Vendedor'] },
        loadComponent: () =>
          import('./pages/clientes/lista-clientes/lista-clientes.component')
            .then(m => m.ListaClientesComponent),
        title: 'Clientes — IBATECH',
      },
    ],
  },
  {
    path:      '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];