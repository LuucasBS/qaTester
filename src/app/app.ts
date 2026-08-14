import { Component, computed, signal } from '@angular/core';
import { LandingPage } from './landing/landing';

type View = 'dashboard' | 'projetos' | 'projeto' | 'fluxo' | 'landing';
type ProjectStatus = 'Em testes' | 'Estável' | 'Atenção';

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  tests: number;
  bugs: number;
  initials: string;
  color: string;
}

interface Company {
  id: number;
  name: string;
  segment: string;
  initials: string;
  projects: Project[];
}

interface Flow {
  id: number;
  name: string;
  description: string;
  owner: string;
  updatedAt: string;
  status: 'Pronto para teste' | 'Em andamento' | 'Aguardando insumos';
  requirements: Requirement[];
}

type RequirementStatus = 'Não testado' | 'Atendido' | 'Não atendido' | 'Parcialmente atendido';

interface Requirement {
  title: string;
  description: string;
  status: RequirementStatus;
  evidence: string;
}

@Component({
  selector: 'app-root',
  imports: [LandingPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly view = signal<View>('dashboard');
  protected readonly sidebarOpen = signal(false);
  protected readonly companyMenuOpen = signal(false);
  protected readonly selectedCompanyId = signal(1);
  protected readonly selectedProjectId = signal<number | null>(null);
  protected readonly selectedFlowId = signal<number | null>(null);
  protected readonly processFile = signal<string | null>(null);
  protected readonly figmaFile = signal<string | null>(null);
  protected readonly developmentTested = signal(false);
  protected readonly finalTested = signal(false);
  protected readonly markedModified = signal(false);
  protected readonly requirementDraft = signal('');
  protected readonly requirementDescriptionDraft = signal('');
  protected readonly requirementEvidenceDraft = signal('');
  protected readonly requirementStatusDraft = signal<RequirementStatus>('Não testado');
  protected readonly editingRequirement = signal<number | null>(null);
  protected readonly showRequirementForm = signal(false);
  protected readonly toast = signal<string | null>(null);
  protected readonly demoRunning = signal(false);
  protected readonly demoProgress = signal(0);
  protected readonly demoStep = signal(0);
  protected readonly demoLogs = signal<string[]>(['Plugin nexTest pronto para iniciar.']);
  protected readonly demoPassed = signal<number | null>(null);

  protected readonly demoScenarios = [
    { name: 'Abrir página de cadastro', detail: 'GET /signup · 200 OK' },
    { name: 'Preencher dados do usuário', detail: 'Campos obrigatórios localizados' },
    { name: 'Validar e-mail informado', detail: 'Código recebido em 1.2s' },
    { name: 'Aceitar termos de uso', detail: 'Checkbox não bloqueia o avanço' },
    { name: 'Concluir onboarding', detail: 'Redirecionamento validado' },
  ];

  protected readonly flows = signal<Flow[]>([
    { id: 1, name: 'Cadastro e onboarding', description: 'Criação da conta, validação dos dados e primeiro acesso.', owner: 'Marina Costa', updatedAt: 'Hoje, 10:32', status: 'Pronto para teste', requirements: [
      { title: 'Cadastro com e-mail e senha', description: 'O usuário deve conseguir criar uma conta informando e-mail válido e senha segura.', status: 'Atendido', evidence: 'Validado na build 2.4.0 nos ambientes web e mobile.' },
      { title: 'Validação do e-mail', description: 'Enviar código de 6 dígitos com expiração de 10 minutos.', status: 'Parcialmente atendido', evidence: 'Código enviado corretamente, mas a mensagem de expiração não é exibida.' },
      { title: 'Aceite dos termos de uso', description: 'Exigir aceite antes de concluir o cadastro e registrar data e versão.', status: 'Não atendido', evidence: 'O cadastro avança mesmo sem selecionar o checkbox.' },
      { title: 'Direcionamento ao onboarding', description: 'Após confirmação, iniciar a jornada de apresentação do produto.', status: 'Não testado', evidence: '' },
    ] },
    { id: 2, name: 'Autenticação e recuperação', description: 'Login, autenticação em dois fatores e recuperação de senha.', owner: 'Rafael Lima', updatedAt: 'Ontem, 16:45', status: 'Em andamento', requirements: [
      { title: 'Autenticação com credenciais válidas', description: 'Permitir acesso com e-mail e senha cadastrados.', status: 'Atendido', evidence: 'Cenários principais aprovados.' },
      { title: 'Bloqueio por tentativas inválidas', description: 'Bloquear o acesso após 5 tentativas consecutivas.', status: 'Não testado', evidence: '' },
      { title: 'Redefinição segura de senha', description: 'Enviar link individual e temporário para redefinição.', status: 'Não testado', evidence: '' },
    ] },
    { id: 3, name: 'Pagamento via Pix', description: 'Criação, confirmação e conciliação de pagamentos instantâneos.', owner: 'Ana Ribeiro', updatedAt: '12 ago, 14:20', status: 'Aguardando insumos', requirements: [
      { title: 'Gerar QR Code e copia e cola', description: 'Gerar dados válidos conforme padrão Pix.', status: 'Não testado', evidence: '' },
      { title: 'Atualizar status após confirmação', description: 'Consumir o retorno do PSP e atualizar a transação.', status: 'Não testado', evidence: '' },
      { title: 'Expiração da cobrança', description: 'Invalidar a cobrança no tempo configurado.', status: 'Não testado', evidence: '' },
    ] },
    { id: 4, name: 'Extrato e comprovantes', description: 'Consulta de movimentações, filtros e emissão de comprovantes.', owner: 'Marina Costa', updatedAt: '10 ago, 09:12', status: 'Pronto para teste', requirements: [
      { title: 'Listar transações', description: 'Apresentar movimentações em ordem cronológica.', status: 'Atendido', evidence: 'Ordenação validada com massa de 120 itens.' },
      { title: 'Filtros de período e tipo', description: 'Permitir combinação de período e categoria.', status: 'Atendido', evidence: 'Todos os filtros aprovados.' },
      { title: 'Exportar comprovante em PDF', description: 'Gerar arquivo com dados completos da transação.', status: 'Parcialmente atendido', evidence: 'PDF gerado sem o identificador E2E.' },
    ] },
  ]);

  protected readonly companies: Company[] = [
    {
      id: 1,
      name: 'Nexus Tech',
      segment: 'Tecnologia financeira',
      initials: 'NT',
      projects: [
        { id: 101, name: 'Nexus Pay', description: 'Aplicativo mobile de pagamentos', progress: 82, status: 'Em testes', tests: 248, bugs: 12, initials: 'NP', color: 'violet' },
        { id: 102, name: 'Portal do Cliente', description: 'Nova experiência web para clientes', progress: 96, status: 'Estável', tests: 184, bugs: 3, initials: 'PC', color: 'cyan' },
        { id: 103, name: 'API Open Finance', description: 'Integração de dados financeiros', progress: 61, status: 'Atenção', tests: 139, bugs: 21, initials: 'OF', color: 'amber' },
      ],
    },
    {
      id: 2,
      name: 'Lumina Saúde',
      segment: 'Healthtech',
      initials: 'LS',
      projects: [
        { id: 201, name: 'Lumina Care', description: 'Jornada digital do paciente', progress: 74, status: 'Em testes', tests: 212, bugs: 9, initials: 'LC', color: 'violet' },
        { id: 202, name: 'Agenda Médica', description: 'Gestão de consultas e equipes', progress: 91, status: 'Estável', tests: 166, bugs: 4, initials: 'AM', color: 'cyan' },
      ],
    },
    {
      id: 3,
      name: 'Vértice Labs',
      segment: 'Software B2B',
      initials: 'VL',
      projects: [
        { id: 301, name: 'Vértice CRM', description: 'Plataforma comercial B2B', progress: 68, status: 'Atenção', tests: 193, bugs: 18, initials: 'VC', color: 'amber' },
        { id: 302, name: 'Analytics Hub', description: 'Painéis de dados em tempo real', progress: 87, status: 'Em testes', tests: 225, bugs: 7, initials: 'AH', color: 'violet' },
      ],
    },
  ];

  protected readonly selectedCompany = computed(() =>
    this.companies.find((company) => company.id === this.selectedCompanyId()) ?? this.companies[0],
  );

  protected readonly selectedProject = computed(() =>
    this.selectedCompany().projects.find((project) => project.id === this.selectedProjectId()) ?? null,
  );

  protected readonly selectedFlow = computed(() =>
    this.flows().find((flow) => flow.id === this.selectedFlowId()) ?? null,
  );

  protected readonly completedSteps = computed(() =>
    [!!this.processFile(), !!this.figmaFile(), this.developmentTested(), this.finalTested()].filter(Boolean).length,
  );

  protected setView(view: View): void {
    this.view.set(view);
    this.sidebarOpen.set(false);
  }

  protected selectCompany(id: number): void {
    this.selectedCompanyId.set(id);
    this.selectedProjectId.set(null);
    this.companyMenuOpen.set(false);
  }

  protected openProject(projectId: number): void {
    this.selectedProjectId.set(projectId);
  }

  protected accessProject(): void {
    if (!this.selectedProject()) return;
    this.view.set('projeto');
    this.selectedFlowId.set(null);
  }

  protected openFlow(flowId: number): void {
    this.selectedFlowId.set(flowId);
    this.resetFlowProgress();
    this.view.set('fluxo');
  }

  protected back(): void {
    if (this.view() === 'fluxo') this.view.set('projeto');
    else if (this.view() === 'projeto') this.view.set('projetos');
  }

  protected attachFile(event: Event, type: 'process' | 'figma'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (type === 'process') this.processFile.set(file.name);
    else this.figmaFile.set(file.name);
    this.showToast(`${file.name} anexado com sucesso`);
  }

  protected saveRequirement(): void {
    const value = this.requirementDraft().trim();
    const flow = this.selectedFlow();
    if (!value || !flow) return;
    const requirement: Requirement = { title: value, description: this.requirementDescriptionDraft().trim(), status: this.requirementStatusDraft(), evidence: this.requirementEvidenceDraft().trim() };
    const requirements = [...flow.requirements];
    const index = this.editingRequirement();
    if (index === null) requirements.push(requirement);
    else requirements[index] = requirement;
    this.updateCurrentFlow({ requirements });
    this.requirementDraft.set('');
    this.requirementDescriptionDraft.set('');
    this.requirementEvidenceDraft.set('');
    this.requirementStatusDraft.set('Não testado');
    this.editingRequirement.set(null);
    this.showRequirementForm.set(false);
    this.showToast(index === null ? 'Requisito adicionado' : 'Requisito atualizado');
  }

  protected editRequirement(index: number): void {
    const requirement = this.selectedFlow()?.requirements[index];
    if (requirement) {
      this.requirementDraft.set(requirement.title);
      this.requirementDescriptionDraft.set(requirement.description);
      this.requirementEvidenceDraft.set(requirement.evidence);
      this.requirementStatusDraft.set(requirement.status);
      this.editingRequirement.set(index);
      this.showRequirementForm.set(true);
    }
  }

  protected deleteRequirement(index: number): void {
    const flow = this.selectedFlow();
    if (!flow) return;
    this.updateCurrentFlow({ requirements: flow.requirements.filter((_, itemIndex) => itemIndex !== index) });
    this.showToast('Requisito removido');
  }

  protected openRequirementForm(): void {
    this.editingRequirement.set(null);
    this.requirementDraft.set('');
    this.requirementDescriptionDraft.set('');
    this.requirementEvidenceDraft.set('');
    this.requirementStatusDraft.set('Não testado');
    this.showRequirementForm.set(true);
  }

  protected cancelRequirementForm(): void {
    this.showRequirementForm.set(false);
    this.editingRequirement.set(null);
    this.requirementDraft.set('');
    this.requirementDescriptionDraft.set('');
    this.requirementEvidenceDraft.set('');
    this.requirementStatusDraft.set('Não testado');
  }

  protected setRequirementStatus(index: number, status: RequirementStatus): void {
    const flow = this.selectedFlow();
    if (!flow) return;
    const requirements = flow.requirements.map((item, itemIndex) => itemIndex === index ? { ...item, status } : item);
    this.updateCurrentFlow({ requirements });
    this.showToast(`Requisito marcado como ${status.toLowerCase()}`);
  }

  protected toggleModified(): void {
    this.markedModified.update((value) => !value);
    if (this.markedModified()) {
      this.developmentTested.set(false);
      this.finalTested.set(false);
      this.showToast('Fluxo marcado para testar novamente');
    }
  }

  protected scheduleConsultation(): void {
    this.showToast('Solicitação de alinhamento registrada para o cliente');
  }

  protected adminAction(action: string): void {
    this.showToast(`${action}: formulário administrativo aberto`);
  }

  protected openLanding(): void {
    this.sidebarOpen.set(false);
    this.view.set('landing');
  }

  protected runDemo(): void {
    if (this.demoRunning()) return;
    this.demoRunning.set(true);
    this.demoProgress.set(0);
    this.demoStep.set(0);
    this.demoPassed.set(null);
    this.demoLogs.set(['Conectando ao ambiente de homologação...', 'Plugin nexTest v2.4.1 inicializado.']);
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      const progress = Math.min(tick * 4, 100);
      const step = Math.min(Math.floor(progress / 20), 4);
      this.demoProgress.set(progress);
      this.demoStep.set(step);
      if (progress % 20 === 0 && progress < 100) {
        const scenario = this.demoScenarios[step];
        this.demoLogs.update((logs) => [...logs, `Executando: ${scenario.name}`, scenario.detail]);
      }
      if (progress >= 100) {
        window.clearInterval(timer);
        this.demoRunning.set(false);
        this.demoPassed.set(4);
        this.demoLogs.update((logs) => [...logs, '1 falha funcional registrada no fluxo.', 'Execução concluída: 4 aprovados, 1 reprovado.']);
      }
    }, 120);
  }

  protected generateReport(): void {
    const flow = this.selectedFlow();
    if (!flow) return;
    const content = `RELATÓRIO DE QUALIDADE\n\nFluxo: ${flow.name}\nEmpresa: ${this.selectedCompany().name}\nProjeto: ${this.selectedProject()?.name}\nProgresso: ${this.completedSteps()}/4 etapas\nReteste solicitado: ${this.markedModified() ? 'Sim' : 'Não'}\n\nRequisitos:\n${flow.requirements.map((item, i) => `${i + 1}. ${item.title}\nStatus: ${item.status}\nDescrição: ${item.description || '-'}\nEvidência: ${item.evidence || '-'}`).join('\n\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `relatorio-${flow.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.showToast('Relatório emitido com sucesso');
  }

  private updateCurrentFlow(changes: Partial<Flow>): void {
    const id = this.selectedFlowId();
    this.flows.update((flows) => flows.map((flow) => flow.id === id ? { ...flow, ...changes } : flow));
  }

  private resetFlowProgress(): void {
    this.processFile.set(null);
    this.figmaFile.set(null);
    this.developmentTested.set(false);
    this.finalTested.set(false);
    this.markedModified.set(false);
    this.requirementDraft.set('');
    this.requirementDescriptionDraft.set('');
    this.requirementEvidenceDraft.set('');
    this.requirementStatusDraft.set('Não testado');
    this.editingRequirement.set(null);
    this.showRequirementForm.set(false);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(null), 3200);
  }
}
