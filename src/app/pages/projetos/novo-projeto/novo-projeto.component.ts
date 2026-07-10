// src/app/pages/projetos/novo-projeto/novo-projeto.component.ts
import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Router }            from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ProjetoService }    from '../../../services/projeto.service';
import { ToastService }      from '../../../services/toast.service';
import { ProjetoCreateRequest } from 'src/app/core/models/projeto.model';

// Definição das 4 etapas do formulário
interface Etapa {
  id:     number;
  titulo: string;
  desc:   string;
  icon:   string;
}

@Component({
  selector:   'app-novo-projeto',
  standalone:  true,
  imports:    [CommonModule, ReactiveFormsModule],
  templateUrl: './novo-projeto.component.html',
  styleUrls:  ['./novo-projeto.component.scss'],
})
export class NovoProjetoComponent implements OnInit {
  private readonly fb      = inject(FormBuilder);
  private readonly svc     = inject(ProjetoService);
  private readonly toast   = inject(ToastService);
  private readonly router  = inject(Router);

  // ── Etapas do wizard ───────────────────────────────────────────────
  readonly etapas: Etapa[] = [
    { id: 1, titulo: 'Identificação',   desc: 'Empresa e contato',          icon: 'building'   },
    { id: 2, titulo: 'Dores e Escopo',  desc: 'Desafios e objetivos',       icon: 'target'     },
    { id: 3, titulo: 'Infraestrutura',  desc: 'Ambiente técnico atual',     icon: 'server'     },
    { id: 4, titulo: 'Confirmação',     desc: 'Revisão e envio',            icon: 'check'      },
  ];

  readonly etapaAtual  = signal(1);
  readonly enviando    = signal(false);
  readonly enviado     = signal(false);
  readonly projetoId   = signal<string | null>(null);

  readonly progresso = computed(
    () => ((this.etapaAtual() - 1) / (this.etapas.length - 1)) * 100
  );
  // readonly podeAvancar = computed(
  //   () => this.formDaEtapa(this.etapaAtual())?.valid ?? false
  // );

  // ── Grupos de formulário por etapa ─────────────────────────────────
  form1!: FormGroup; // Identificação
  form2!: FormGroup; // Dores e Escopo
  form3!: FormGroup; // Infraestrutura

  ngOnInit(): void {
    this.form1 = this.fb.group({
      nomeEmpresa:  ['', [Validators.required, Validators.minLength(2)]],
      nomeContato:  ['', [Validators.required, Validators.minLength(2)]],
      emailContato: ['', [Validators.required, Validators.email]],
    });

    this.form2 = this.fb.group({
      descricaoDores:   ['', [Validators.required, Validators.minLength(30)]],
      observacoesExtra: [''],
    });

    this.form3 = this.fb.group({
      infraAtual:         ['', [Validators.required, Validators.minLength(20)]],
      utilizaNuvem:       [false],
      provedorNuvem:      [''],
      volumetriaUsuarios: [
        null,
        [Validators.required, Validators.min(1), Validators.max(10_000_000)],
      ],
    });

    // Validação condicional: provedorNuvem obrigatório se utilizaNuvem = true
    this.form3.get('utilizaNuvem')!.valueChanges.subscribe((usa: boolean) => {
      const ctrl = this.form3.get('provedorNuvem')!;
      if (usa) {
        ctrl.setValidators([Validators.required]);
      } else {
        ctrl.clearValidators();
        ctrl.setValue('');
      }
      ctrl.updateValueAndValidity();
    });
  }

  // ── Navegação entre etapas ─────────────────────────────────────────
  avancar(): void {
    const form = this.formDaEtapa(this.etapaAtual());
    if (form && form.invalid) {
      form.markAllAsTouched();
      return;
    }
    if (this.etapaAtual() < this.etapas.length) {
      this.etapaAtual.update(n => n + 1);
    }
  }

  voltar(): void {
    if (this.etapaAtual() > 1) {
      this.etapaAtual.update(n => n - 1);
    }
  }

  irParaEtapa(n: number): void {
    // Permite navegar para etapas anteriores livremente
    if (n < this.etapaAtual()) {
      this.etapaAtual.set(n);
    }
  }

  // ── Envio final ────────────────────────────────────────────────────
  enviar(): void {
    if (this.form1.invalid || this.form2.invalid || this.form3.invalid) {
      this.toast.error('Preencha todos os campos obrigatórios antes de enviar.');
      return;
    }

    this.enviando.set(true);

    const dto: ProjetoCreateRequest = {
      ...this.form1.value,
      ...this.form2.value,
      ...this.form3.value,
    };

    this.svc.criar(dto).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.enviado.set(true);
        this.projetoId.set(res.id);
        this.toast.success('Projeto enviado! Nossa equipe entrará em contato.');
      },
      error: () => {
        this.enviando.set(false);
        // Mensagem específica já tratada pelo error interceptor
      },
    });
  }

  verProjeto(): void {
    this.router.navigate(['/dashboard/projetos', this.projetoId()]);
  }

  novoProjeto(): void {
    this.form1.reset();
    this.form2.reset();
    this.form3.reset({ utilizaNuvem: false });
    this.etapaAtual.set(1);
    this.enviado.set(false);
    this.projetoId.set(null);
  }

  // ── Utilitários de template ────────────────────────────────────────
  formDaEtapa(n: number): FormGroup | null {
    return [null, this.form1, this.form2, this.form3, null][n] ?? null;
  }

  ctrl(form: FormGroup, campo: string): AbstractControl {
    return form.get(campo)!;
  }

  temErro(form: FormGroup, campo: string): boolean {
    const c = this.ctrl(form, campo);
    return c.invalid && (c.dirty || c.touched);
  }

  msgErro(form: FormGroup, campo: string): string {
    const erros = this.ctrl(form, campo).errors;
    if (!erros) return '';
    if (erros['required'])   return 'Campo obrigatório.';
    if (erros['email'])      return 'E-mail inválido.';
    if (erros['minlength'])  return `Mínimo ${erros['minlength'].requiredLength} caracteres.`;
    if (erros['min'])        return `Valor mínimo: ${erros['min'].min}.`;
    if (erros['max'])        return `Valor máximo: ${erros['max'].max}.`;
    return 'Valor inválido.';
  }

  // Formatação de volumetria para exibição na etapa de revisão
  formatarVolume(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M usuários`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K usuários`;
    return `${v} usuários`;
  }
}