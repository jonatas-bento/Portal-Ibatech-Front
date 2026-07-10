import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjetoService } from 'src/app/services/projeto.service';
import { AuthService } from 'src/app/services/auth.service';
import { STATUS_BADGE_CLASS, STATUS_LABELS, StatusProjeto } from 'src/app/core/models/projeto.model';

@Component({
  selector: 'app-projetos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projetos-lista.component.html',
  styleUrls: ['./projetos-lista.component.scss']
})
export class ProjetosListaComponent implements OnInit {
  // Injeção dos serviços existentes
  readonly projetoService = inject(ProjetoService);
  readonly auth = inject(AuthService);

  // Estados locais para controle de UI
  readonly carregando = signal<boolean>(false);
  readonly erroMsg = signal<string | null>(null);

  // Expõe os dicionários para o HTML
  
  readonly statusLabels = STATUS_LABELS;

  ngOnInit(): void {
    this.carregarProjetos();
  }

 

  carregarProjetos(): void {
    this.carregando.set(true);
    this.erroMsg.set(null);

    // Decide o método de listagem com base na regra de negócio/Role
    const call$ = this.auth.isCliente()
      ? this.projetoService.listarMeus()
      : this.projetoService.listar();

    call$.subscribe({
      error: (err) => {
        console.error(err);
        this.erroMsg.set('Erro ao sincronizar dados com o laboratório Ibatech.');
        this.carregando.set(false);
      },
      complete: () => {
        this.carregando.set(false);
      }
    });
  }
}