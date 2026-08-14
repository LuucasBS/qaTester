import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css', './pipeline.css'],
})
export class LandingPage {
  readonly exitLanding = output<void>();
  readonly running = signal(false);
  readonly progress = signal(0);
  readonly currentStep = signal(0);
  readonly completed = signal(false);
  readonly logs = signal<string[]>(['Plugin nexTest pronto para iniciar.']);
  readonly demoTab = signal<'plugin' | 'success' | 'failure'>('plugin');

  readonly scenarios = [
    { name: 'Abrir página de cadastro', detail: 'GET /signup · 200 OK' },
    { name: 'Preencher dados do usuário', detail: 'Campos obrigatórios localizados' },
    { name: 'Validar e-mail informado', detail: 'Código recebido em 1.2s' },
    { name: 'Aceitar termos de uso', detail: 'Checkbox não bloqueia o avanço' },
    { name: 'Concluir onboarding', detail: 'Redirecionamento validado' },
  ];

  run(): void {
    if (this.running()) return;
    document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' });
    this.running.set(true);
    this.completed.set(false);
    this.progress.set(0);
    this.currentStep.set(0);
    this.logs.set(['Conectando ao ambiente de homologação...', 'Plugin nexTest v2.4.1 inicializado.']);
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      const value = Math.min(tick * 4, 100);
      const step = Math.min(Math.floor(value / 20), 4);
      this.progress.set(value);
      this.currentStep.set(step);
      if (value % 20 === 0 && value < 100) {
        const scenario = this.scenarios[step];
        this.logs.update((logs) => [...logs, `Executando: ${scenario.name}`, scenario.detail]);
      }
      if (value === 100) {
        window.clearInterval(timer);
        this.running.set(false);
        this.completed.set(true);
        this.logs.update((logs) => [...logs, 'Falha funcional registrada no aceite dos termos.', 'Execução concluída: 4 aprovados, 1 reprovado.']);
      }
    }, 120);
  }
}
