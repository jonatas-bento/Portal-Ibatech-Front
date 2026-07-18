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
        loadComponent: () => import('./pages/projetos/projetos-lista/projetos-lista.component').then(m => m.ProjetosListaComponent)
      },
      {
        path: 'projetos/novo',
        loadComponent: () => import('./pages/projetos/novo-projeto/novo-projeto.component').then(m => m.NovoProjetoComponent)
      },
      {
        path:        'estoque',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Funcionario'] },
        loadComponent: () => import('./pages/estoque/lista-produtos/lista-produtos.component').then(m => m.ListaProdutosComponent)
      },
      {
        path:        'financeiro',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Financeiro'] },
        loadComponent: () => import('./pages/financeiro/painel-financeiro/painel-financeiro.component').then(m => m.PainelFinanceiroComponent)
      },
      {
        path:        'usuarios',
        canActivate: [roleGuard],
        data:        { roles: ['Admin'] },
        loadComponent: () => import('./pages/usuarios/lista-usuarios/lista-usuarios.component').then(m => m.ListaUsuariosComponent)
      },
      {
        path:        'clientes',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Vendedor'] },
        loadComponent: () => import('./pages/clientes/lista-clientes/lista-clientes.component').then(m => m.ListaClientesComponent)
      },
      {
        path:        'vendas',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Vendedor'] },
        loadComponent: () => import('./pages/vendas/lista-vendas/lista-vendas.component').then(m => m.ListaVendasComponent),
        title: 'Vendas — IBATECH',
      },
      {
        path:        'vendas/:id',
        canActivate: [roleGuard],
        data:        { roles: ['Admin', 'Vendedor'] },
        loadComponent: () => import('./pages/vendas/editar-venda/editar-venda.component').then(m => m.EditarVendaComponent),
        title: 'Editar Venda — IBATECH',
      },
    ],
  },
  {
    path:      '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
