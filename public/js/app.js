/* ═══════════════════════════════════════════════════════════════
   LinkedIn Career Agent · app.js
   Estado, navegação, geração IA, progresso, localStorage
═══════════════════════════════════════════════════════════════ */

const MODULES_CONFIG = [
  {
    id: 'diagnostico',
    icon: '🔍',
    title: 'Diagnóstico do Mercado',
    description: 'Score do perfil LinkedIn, top palavras-chave da sua área e análise completa da concorrência.',
    time: '3-5 min',
  },
  {
    id: 'otimizacao',
    icon: '✨',
    title: 'Otimização do LinkedIn',
    description: 'Headlines magnéticas, resumo com storytelling, experiências com métricas e top 50 skills.',
    time: '5-7 min',
  },
  {
    id: 'vagas',
    icon: '🎯',
    title: 'Vagas Ocultas',
    description: 'Estratégia para 80% das vagas não publicadas, 20 empresas-alvo e scripts prontos de abordagem.',
    time: '4-6 min',
  },
  {
    id: 'conteudo',
    icon: '📱',
    title: 'Calendário de Conteúdo',
    description: '30 posts prontos para publicar que vão te posicionar como autoridade e atrair recrutadores.',
    time: '6-8 min',
  },
  {
    id: 'ferramentas',
    icon: '🛠️',
    title: 'Ferramentas de Carreira',
    description: 'Guia completo de ferramentas gratuitas e pagas + extensões Chrome + automações seguras.',
    time: '3-4 min',
  },
  {
    id: 'curriculo',
    icon: '📄',
    title: 'Currículo ATS',
    description: 'Currículo completo otimizado para sistemas ATS com palavras-chave e formato correto.',
    time: '5-7 min',
  },
  {
    id: 'entrevistas',
    icon: '🎤',
    title: 'Preparação para Entrevistas',
    description: '30 perguntas + respostas modelo, negociação salarial e checklist pré-entrevista.',
    time: '5-8 min',
  },
];

/* ─── Estado da aplicação ─── */
const STATE = {
  currentView: 'landing',
  currentModule: null,
  profile: null,
  moduleData: {},
  planData: null,
};

/* ─── Inicialização ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  animateCounter();
  marked.setOptions({ breaks: true, gfm: true });

  if (STATE.profile) {
    renderDashboard();
    app.showView('dashboard');
  }
});

function loadFromStorage() {
  try {
    const profile = localStorage.getItem('lca_profile');
    const moduleData = localStorage.getItem('lca_modules');
    const planData = localStorage.getItem('lca_plan');
    if (profile) STATE.profile = JSON.parse(profile);
    if (moduleData) STATE.moduleData = JSON.parse(moduleData);
    if (planData) STATE.planData = planData;
  } catch (e) {
    console.warn('Error loading from storage:', e);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('lca_profile', JSON.stringify(STATE.profile));
    localStorage.setItem('lca_modules', JSON.stringify(STATE.moduleData));
    if (STATE.planData) localStorage.setItem('lca_plan', STATE.planData);
  } catch (e) {
    console.warn('Error saving to storage:', e);
  }
}

/* ─── Counter animation (landing) ─── */
function animateCounter() {
  const el = document.getElementById('user-counter');
  if (!el) return;
  const target = 12847 + Math.floor(Math.random() * 200);
  let current = target - 300;
  const step = () => {
    current += Math.ceil((target - current) / 10);
    el.textContent = current.toLocaleString('pt-BR');
    if (current < target) requestAnimationFrame(step);
  };
  step();
}

/* ─── View navigation ─── */
const app = {

  showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById(`${viewName}-view`);
    if (el) el.classList.add('active');
    STATE.currentView = viewName;
    window.scrollTo(0, 0);
  },

  /* ─── Onboarding ─── */
  nextStep(current) {
    if (!validateStep(current)) return;
    const next = current + 1;
    document.getElementById(`step-${current}`).style.display = 'none';
    document.getElementById(`step-${next}`).style.display = 'block';
    updateStepDots(next);
  },

  prevStep(current) {
    const prev = current - 1;
    document.getElementById(`step-${current}`).style.display = 'none';
    document.getElementById(`step-${prev}`).style.display = 'block';
    updateStepDots(prev);
  },

  finishOnboarding() {
    if (!validateStep(4)) return;
    const cidade = val('cidade');
    const estado = val('estado');

    STATE.profile = {
      nome: val('nome'),
      email: val('email'),
      linkedin_url: val('linkedin_url'),
      area: val('area'),
      cargo: val('cargo'),
      experiencia: val('experiencia'),
      setor: val('setor'),
      especializacoes: val('especializacoes'),
      certificacoes: val('certificacoes'),
      objetivo: val('objetivo'),
      tipo_empresa: val('tipo_empresa'),
      modalidade: val('modalidade'),
      cidade: `${cidade}, ${estado}`,
      disponibilidade: val('disponibilidade'),
      salario: val('salario'),
    };

    saveToStorage();
    renderDashboard();
    app.showView('dashboard');
    showToast('🎉 Perfil criado! Comece gerando os módulos.', 'success');
  },

  /* ─── Dashboard ─── */
  openModule(moduleId) {
    const mod = MODULES_CONFIG.find(m => m.id === moduleId);
    if (!mod) return;
    STATE.currentModule = moduleId;

    document.getElementById('module-view-icon').textContent = mod.icon;
    document.getElementById('module-view-title').textContent = mod.title;

    const isDone = !!STATE.moduleData[moduleId];
    const statusEl = document.getElementById('module-view-status');
    statusEl.className = `module-status ${isDone ? 'completed' : 'pending'}`;
    statusEl.textContent = isDone ? '✅ Concluído' : '⬜ Pendente';

    renderProfileSummary();

    const contentArea = document.getElementById('content-area');
    if (isDone) {
      showGeneratedContent(contentArea, STATE.moduleData[moduleId], mod);
    } else {
      showEmptyContent(contentArea, mod);
    }

    app.showView('module');
  },

  async generateModule() {
    const moduleId = STATE.currentModule;
    const mod = MODULES_CONFIG.find(m => m.id === moduleId);
    if (!mod || !STATE.profile) return;

    const contentArea = document.getElementById('content-area');
    showLoadingContent(contentArea, mod);
    document.getElementById('generate-btn').disabled = true;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: moduleId, profile: STATE.profile }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar conteúdo');

      STATE.moduleData[moduleId] = data.content;
      saveToStorage();

      showGeneratedContent(contentArea, data.content, mod);

      const statusEl = document.getElementById('module-view-status');
      statusEl.className = 'module-status completed';
      statusEl.textContent = '✅ Concluído';

      updateDashboardProgress();
      showToast(`✅ ${mod.title} gerado com sucesso!`, 'success');
    } catch (err) {
      showEmptyContent(contentArea, mod, err.message);
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      document.getElementById('generate-btn').disabled = false;
    }
  },

  copyContent() {
    const content = STATE.moduleData[STATE.currentModule];
    if (!content) return;
    navigator.clipboard.writeText(content)
      .then(() => showToast('📋 Conteúdo copiado!', 'success'))
      .catch(() => showToast('Erro ao copiar. Selecione o texto manualmente.', 'error'));
  },

  downloadContent() {
    const content = STATE.moduleData[STATE.currentModule];
    const mod = MODULES_CONFIG.find(m => m.id === STATE.currentModule);
    if (!content || !mod) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mod.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⬇️ Arquivo baixado!', 'success');
  },

  /* ─── 90-day plan ─── */
  showPlanView() {
    const done = Object.keys(STATE.moduleData).length;
    if (done < 3) {
      showToast('Complete pelo menos 3 módulos para gerar o plano!', 'info');
      return;
    }

    renderPlanMeta();

    const planContentArea = document.getElementById('plan-content-area');
    if (STATE.planData) {
      showPlanContent(planContentArea, STATE.planData);
    } else {
      planContentArea.innerHTML = `
        <div class="content-empty">
          <div class="empty-icon">🗓️</div>
          <h3>Plano de 90 Dias personalizado</h3>
          <p>Clique em "Gerar Plano com IA" para criar seu cronograma semana a semana baseado no seu perfil e progresso.</p>
        </div>`;
    }

    app.showView('plan');
  },

  async generatePlan() {
    const planContentArea = document.getElementById('plan-content-area');
    const completedModules = Object.keys(STATE.moduleData).map(id => {
      const m = MODULES_CONFIG.find(m => m.id === id);
      return m ? m.title : id;
    });

    planContentArea.innerHTML = `
      <div class="content-loading">
        <div class="spinner"></div>
        <div class="loading-text">
          <h3>Criando seu Plano de 90 Dias...</h3>
          <p>A IA está montando seu cronograma personalizado semana a semana</p>
        </div>
      </div>`;

    document.getElementById('plan-generate-btn').disabled = true;

    try {
      const res = await fetch('/api/plano90dias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: STATE.profile, completedModules }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar plano');

      STATE.planData = data.content;
      saveToStorage();
      showPlanContent(planContentArea, data.content);
      showToast('✅ Plano de 90 dias gerado!', 'success');
    } catch (err) {
      planContentArea.innerHTML = `
        <div class="content-empty">
          <div class="empty-icon">❌</div>
          <h3>Erro ao gerar plano</h3>
          <p>${err.message}</p>
        </div>`;
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      document.getElementById('plan-generate-btn').disabled = false;
    }
  },

  copyPlan() {
    if (!STATE.planData) return;
    navigator.clipboard.writeText(STATE.planData)
      .then(() => showToast('📋 Plano copiado!', 'success'))
      .catch(() => showToast('Erro ao copiar.', 'error'));
  },

  resetData() {
    if (!confirm('Tem certeza que deseja reiniciar? Todos os dados gerados serão perdidos.')) return;
    localStorage.removeItem('lca_profile');
    localStorage.removeItem('lca_modules');
    localStorage.removeItem('lca_plan');
    STATE.profile = null;
    STATE.moduleData = {};
    STATE.planData = null;
    STATE.currentModule = null;
    resetOnboardingForm();
    app.showView('landing');
    showToast('Dados reiniciados. Comece novamente!', 'info');
  },
};

/* ─── Validation ─── */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function validateStep(step) {
  const required = {
    1: ['nome', 'email'],
    2: ['area', 'cargo', 'experiencia', 'setor'],
    3: ['objetivo'],
    4: ['cidade', 'estado'],
  };

  const fields = required[step] || [];
  for (const fieldId of fields) {
    const el = document.getElementById(fieldId);
    if (!el || !el.value.trim()) {
      el?.focus();
      el?.classList.add('error');
      setTimeout(() => el?.classList.remove('error'), 2000);
      showToast('Preencha todos os campos obrigatórios ⚠️', 'error');
      return false;
    }
  }
  return true;
}

function updateStepDots(activeStep) {
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) continue;
    dot.className = 'step-dot';
    if (i < activeStep) dot.classList.add('completed'), dot.textContent = '✓';
    else if (i === activeStep) dot.classList.add('active'), dot.textContent = i;
    else dot.textContent = i;
  }
  for (let i = 1; i <= 3; i++) {
    const line = document.getElementById(`line-${i}`);
    if (line) line.className = `step-line${i < activeStep ? ' completed' : ''}`;
  }
}

function resetOnboardingForm() {
  ['nome','email','linkedin_url','area','cargo','experiencia','setor',
   'especializacoes','certificacoes','objetivo','tipo_empresa','modalidade',
   'cidade','estado','disponibilidade','salario'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  for (let i = 1; i <= 4; i++) {
    const card = document.getElementById(`step-${i}`);
    if (card) card.style.display = i === 1 ? 'block' : 'none';
  }
  updateStepDots(1);
}

/* ─── Dashboard rendering ─── */
function renderDashboard() {
  if (!STATE.profile) return;
  document.getElementById('dash-user-name').textContent = STATE.profile.nome.split(' ')[0];
  renderModulesGrid();
  updateDashboardProgress();
}

function renderModulesGrid() {
  const grid = document.getElementById('modules-grid');
  grid.innerHTML = MODULES_CONFIG.map(mod => {
    const isDone = !!STATE.moduleData[mod.id];
    return `
      <div class="module-card ${isDone ? 'completed' : ''}" onclick="app.openModule('${mod.id}')">
        <div class="module-header">
          <div class="module-icon">${mod.icon}</div>
          <div class="module-status ${isDone ? 'completed' : 'pending'}">
            ${isDone ? '✅ Concluído' : '⬜ Pendente'}
          </div>
        </div>
        <h3>${mod.title}</h3>
        <p>${mod.description}</p>
        <div class="module-footer">
          <span class="module-time">⏱️ ${mod.time}</span>
          <span class="module-arrow">→</span>
        </div>
      </div>`;
  }).join('');
}

function updateDashboardProgress() {
  const done = Object.keys(STATE.moduleData).length;
  const total = MODULES_CONFIG.length;
  const pct = Math.round((done / total) * 100);

  document.getElementById('modules-done').textContent = done;
  document.getElementById('main-progress-bar').style.width = `${pct}%`;
  document.getElementById('progress-pct').textContent = `${pct}% concluído`;

  const tips = [
    'Complete os módulos para aumentar suas chances!',
    'Ótimo começo! Continue gerando os módulos.',
    'Você está no caminho certo! 💪',
    'Mais da metade! Continue assim!',
    'Quase lá! Só mais alguns módulos.',
    'Incrível progresso! Finalize tudo!',
    '🎉 Todos os módulos completos! Gere seu plano de 90 dias!',
  ];
  document.getElementById('progress-tip').textContent = tips[Math.min(done, tips.length - 1)];

  const daysMap = { 0: 90, 1: 80, 2: 70, 3: 60, 4: 50, 5: 40, 6: 30, 7: 20 };
  document.getElementById('days-estimate').textContent = `${daysMap[done] || 20} dias`;

  // Update plan button
  const planBtn = document.getElementById('plan-btn');
  const planLocked = document.getElementById('plan-locked');
  if (done >= 3) {
    planBtn.style.display = 'inline-flex';
    if (planLocked) planLocked.style.display = 'none';
  } else {
    planBtn.style.display = 'none';
    if (planLocked) planLocked.style.display = 'flex';
  }

  renderModulesGrid();
}

/* ─── Module view helpers ─── */
function renderProfileSummary() {
  const p = STATE.profile;
  if (!p) return;
  document.getElementById('profile-summary').innerHTML = `
    <div class="profile-tag">👤 <strong>${p.nome}</strong></div>
    <div class="profile-tag">💼 <strong>${p.cargo}</strong></div>
    <div class="profile-tag">🏢 <strong>${p.area}</strong></div>
    <div class="profile-tag">📍 <strong>${p.cidade}</strong></div>
    <div class="profile-tag">🎯 <strong>${p.objetivo}</strong></div>
  `;
}

function showEmptyContent(container, mod, errorMsg) {
  container.innerHTML = `
    <div class="content-empty">
      <div class="empty-icon">${errorMsg ? '❌' : mod.icon}</div>
      <h3>${errorMsg ? 'Erro ao gerar conteúdo' : 'Pronto para gerar!'}</h3>
      <p>${errorMsg || `Clique em "Gerar com IA" para criar seu ${mod.title} personalizado. Tempo estimado: ${mod.time}.`}</p>
    </div>`;
  document.getElementById('generate-btn').style.display = 'inline-flex';
  document.getElementById('copy-btn').style.display = 'none';
  document.getElementById('download-btn').style.display = 'none';
  document.getElementById('regen-btn').style.display = 'none';
}

function showLoadingContent(container, mod) {
  const tips = [
    'Analisando seu perfil profissional...',
    'Pesquisando o mercado para sua área...',
    'Aplicando estratégias de carreira personalizadas...',
    'Formatando o conteúdo com melhores práticas...',
  ];
  let tipIdx = 0;
  container.innerHTML = `
    <div class="content-loading">
      <div class="spinner"></div>
      <div class="loading-text">
        <h3>Gerando ${mod.title}...</h3>
        <p id="loading-tip">${tips[0]}</p>
      </div>
    </div>`;
  const tipInterval = setInterval(() => {
    tipIdx = (tipIdx + 1) % tips.length;
    const tipEl = document.getElementById('loading-tip');
    if (tipEl) tipEl.textContent = tips[tipIdx];
    else clearInterval(tipInterval);
  }, 2500);

  document.getElementById('generate-btn').style.display = 'none';
  document.getElementById('copy-btn').style.display = 'none';
  document.getElementById('download-btn').style.display = 'none';
  document.getElementById('regen-btn').style.display = 'none';
}

function showGeneratedContent(container, content, mod) {
  const rendered = marked.parse(content);
  container.innerHTML = `<div class="markdown-body">${rendered}</div>
    <div class="content-toolbar">
      <span class="toolbar-label">✅ Gerado com sucesso · ${mod.time}</span>
    </div>`;

  document.getElementById('generate-btn').style.display = 'none';
  document.getElementById('copy-btn').style.display = 'inline-flex';
  document.getElementById('download-btn').style.display = 'inline-flex';
  document.getElementById('regen-btn').style.display = 'inline-flex';
}

/* ─── Plan view ─── */
function renderPlanMeta() {
  const p = STATE.profile;
  const done = Object.keys(STATE.moduleData).length;
  document.getElementById('plan-meta').innerHTML = `
    <div class="plan-meta-badge">👤 ${p.nome}</div>
    <div class="plan-meta-badge">🎯 ${p.objetivo}</div>
    <div class="plan-meta-badge">📍 ${p.cidade}</div>
    <div class="plan-meta-badge">✅ ${done}/7 módulos</div>
  `;
}

function showPlanContent(container, content) {
  const rendered = marked.parse(content);
  container.innerHTML = `<div class="markdown-body">${rendered}</div>`;
  document.getElementById('plan-copy-btn').style.display = 'inline-flex';
  document.getElementById('plan-generate-btn').textContent = '🔄 Regenerar Plano';
}

/* ─── Toast notifications ─── */
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = message;
  document.getElementById('toast-icon').textContent = icons[type] || 'ℹ️';
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
