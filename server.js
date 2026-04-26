const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const MODULE_PROMPTS = {
  diagnostico: (p) => `Você é um especialista sênior em mercado de trabalho, recrutamento e LinkedIn com 15 anos de experiência no Brasil. Analise o perfil profissional abaixo e forneça uma análise completa e detalhada.

## PERFIL DO PROFISSIONAL:
- Nome: ${p.nome}
- Área de atuação: ${p.area}
- Cargo atual/último: ${p.cargo}
- Anos de experiência: ${p.experiencia}
- Especializações: ${p.especializacoes || 'não informado'}
- Certificações: ${p.certificacoes || 'não informado'}
- Setor/indústria: ${p.setor}
- Objetivo: ${p.objetivo}
- Cidade/Estado: ${p.cidade}
- Modalidade desejada: ${p.modalidade}

## ENTREGUE:

### 🎯 SCORE DO PERFIL LINKEDIN (0-100)
Atribua uma nota de 0 a 100 com justificativa detalhada em cada critério:
- Completude do perfil (0-15 pontos)
- Headline e resumo (0-20 pontos)
- Experiências e conquistas (0-20 pontos)
- Habilidades e endorsements (0-15 pontos)
- Rede e conexões estimada (0-15 pontos)
- Atividade e engajamento (0-15 pontos)
**SCORE TOTAL: X/100**

### 🔑 TOP 25 PALAVRAS-CHAVE ESTRATÉGICAS
Para a área de ${p.area}, liste as 25 palavras-chave mais pesquisadas por recrutadores:
(Formate como lista numerada com a frequência de uso pelos recrutadores)

### 📊 ANÁLISE DO MERCADO
- Panorama atual para ${p.cargo} no Brasil
- Demanda no mercado (alta/média/baixa) com justificativa
- Principais empresas que contratam esse perfil em ${p.cidade}
- Tendências para os próximos 2 anos
- Salário médio de mercado para o cargo em ${p.cidade}

### 🚨 LACUNAS CRÍTICAS NO PERFIL
Liste as 5 maiores lacunas que estão reduzindo as chances de ser encontrado por recrutadores.

### ✅ OPORTUNIDADES IMEDIATAS
Liste 5 ações concretas que podem ser tomadas nos próximos 7 dias para melhorar a visibilidade.

### 🏆 PERFIL COMPETITIVO
Descreva o perfil típico dos concorrentes que estão sendo contratados para ${p.cargo} hoje.

Seja específico, use dados reais do mercado brasileiro de 2024-2025.`,

  otimizacao: (p) => `Você é um especialista em LinkedIn, personal branding e copywriting para carreira. Crie otimizações completas e prontas para uso.

## PERFIL:
- Nome: ${p.nome}
- Cargo: ${p.cargo}
- Área: ${p.area}
- Experiência: ${p.experiencia} anos
- Especializações: ${p.especializacoes || 'não informado'}
- Certificações: ${p.certificacoes || 'não informado'}
- Setor: ${p.setor}
- Objetivo: ${p.objetivo}
- Cidade: ${p.cidade}

## ENTREGUE:

### ✨ 3 OPÇÕES DE HEADLINE (máximo 220 caracteres cada)
Para cada headline, explique a estratégia por trás dela:
**Headline 1 - Foco em Cargo:**
**Headline 2 - Foco em Resultado:**
**Headline 3 - Foco em Transformação:**

### 📝 RESUMO/ABOUT COMPLETO
Escreva um resumo de 1800-2000 caracteres usando storytelling. Deve incluir:
- Abertura impactante (não comece com "Sou")
- Proposta de valor única
- 3 conquistas principais com métricas
- Habilidades-chave em negrito
- Call to action no final

### 💼 OTIMIZAÇÃO DAS EXPERIÊNCIAS
Para o cargo mais recente (${p.cargo}), reescreva 5 bullets de responsabilidades usando o método CAR (Context, Action, Result) com métricas e palavras-chave.

### 🛠️ TOP 50 SKILLS RECOMENDADAS
Liste as 50 skills mais relevantes divididas em categorias:
- Habilidades Técnicas (25)
- Habilidades Comportamentais (15)
- Ferramentas e Tecnologias (10)

### 🤝 ESTRATÉGIA DE RECOMENDAÇÕES
- Quem pedir recomendação (perfis ideais)
- Script para solicitar recomendação
- Template de recomendação para pedir que a pessoa escreva

### 🔗 URL PERSONALIZADA
Sugestões de URL personalizada para o perfil.

### 📸 DICAS DE FOTO E BANNER
Especificações técnicas e estratégicas para foto profissional e banner do LinkedIn.`,

  vagas: (p) => `Você é um headhunter sênior com 15 anos de experiência no mercado brasileiro. Crie uma estratégia completa para encontrar vagas ocultas (80% das vagas nunca são publicadas).

## PERFIL:
- Nome: ${p.nome}
- Cargo: ${p.cargo}
- Área: ${p.area}
- Setor: ${p.setor}
- Objetivo: ${p.objetivo}
- Cidade: ${p.cidade}
- Modalidade: ${p.modalidade}
- Salário desejado: ${p.salario || 'não informado'}

## ENTREGUE:

### 🏢 MAPA DAS 20 EMPRESAS-ALVO
Para cada empresa, inclua:
- Nome da empresa
- Por que ela contrata perfis como o seu
- LinkedIn da empresa
- Como abordá-la

### 📨 5 SCRIPTS DE MENSAGEM PARA LINKEDIN
Mensagens prontas para enviar para recrutadores e gestores (personalizadas para ${p.area}):
**Script 1 - Abordagem Direta:**
**Script 2 - Conexão por Interesse:**
**Script 3 - Indicação Interna:**
**Script 4 - Após Conteúdo Publicado:**
**Script 5 - Follow-up:**

### 🎯 SCRIPT PARA HEADHUNTERS/RECRUTADORES
Mensagem perfeita para enviar a headhunters especializados em ${p.area}.

### 🌐 NETWORKING ESTRATÉGICO
- 10 tipos de profissionais para conectar imediatamente
- Como conseguir apresentações (warm intro)
- Eventos e meetups relevantes para ${p.area}

### 👥 GRUPOS E COMUNIDADES
- Top 10 grupos do LinkedIn para ${p.area}
- Comunidades no WhatsApp/Telegram
- Fóruns e comunidades online

### 📅 CALENDÁRIO DE PROSPECÇÃO (2 semanas)
Plano dia a dia com metas:
- Semana 1: [ações específicas por dia]
- Semana 2: [ações específicas por dia]

### 🌍 SITES E PLATAFORMAS ESPECIALIZADAS
Top 15 sites para encontrar vagas em ${p.area} além do LinkedIn.`,

  conteudo: (p) => `Você é um estrategista de conteúdo especializado em LinkedIn com casos de sucesso comprovados. Crie um calendário completo de 30 posts que vão posicionar ${p.nome} como autoridade em ${p.area}.

## PERFIL:
- Área: ${p.area}
- Cargo: ${p.cargo}
- Objetivo: ${p.objetivo}
- Setor: ${p.setor}

## ENTREGUE:

Para cada um dos 30 posts, forneça:

**POST [número] - [Semana X, Dia Y]**
- 📌 Formato: [texto/carrossel/enquete/vídeo/documento]
- ⏰ Melhor horário: [horário]
- 🎯 Objetivo: [engajamento/autoridade/networking/recrutadores]
- 📢 Hook (primeira linha irresistível):
- 📄 Corpo completo do post (com emojis, quebras de linha naturais):
- 🏷️ Hashtags: [5-8 hashtags estratégicas]
- 💬 Comentário estratégico para fixar:

Os 30 posts devem cobrir esses tipos de conteúdo:
- 8 posts de experiências e aprendizados pessoais
- 6 posts de dicas técnicas da área
- 5 posts de tendências e notícias do setor
- 4 posts sobre erros e como superei
- 4 posts de bastidores e processo de trabalho
- 3 posts de celebração de conquistas (reais ou simuladas)

IMPORTANTE: Escreva os posts COMPLETOS, prontos para publicar, não apenas estruturas ou templates.`,

  ferramentas: (p) => `Você é um especialista em produtividade e tecnologia para carreira. Crie um guia completo e prático de ferramentas para ${p.nome} conseguir emprego em ${p.area}.

## PERFIL:
- Área: ${p.area}
- Cargo: ${p.cargo}
- Objetivo: ${p.objetivo}

## ENTREGUE:

### 🆓 FERRAMENTAS GRATUITAS ESSENCIAIS (mínimo 20)
Para cada ferramenta:
| Ferramenta | Link | Para que serve | Como usar na busca de emprego | Nota (0-5) |

### 💰 FERRAMENTAS PAGAS QUE VALEM O INVESTIMENTO (mínimo 10)
Para cada ferramenta:
| Ferramenta | Preço/mês | ROI esperado | Melhor para | Alternativa gratuita |

### 🔌 TOP 10 EXTENSÕES DO CHROME PARA LINKEDIN
Para cada extensão:
- Nome + link da Chrome Store
- O que faz exatamente
- Como usar estrategicamente

### ✅ O QUE É SEGURO FAZER (Automações permitidas)
- Automações que o LinkedIn permite
- O que pode resultar em banimento
- Limite seguro de ações por dia

### 📊 STACK COMPLETA POR OBJETIVO
**Para Recolocação Rápida:** [ferramentas prioritárias]
**Para Crescimento de Carreira:** [ferramentas prioritárias]
**Para Mudança de Área:** [ferramentas prioritárias]

### 📋 TEMPLATE DE PLANILHA DE CONTROLE
Estrutura completa de uma planilha para controlar candidaturas:
- Colunas necessárias
- Fórmulas úteis
- Como usar no dia a dia`,

  curriculo: (p) => `Você é um especialista em RH, ATS (Applicant Tracking System) e redação de currículos com 15 anos de experiência. Crie um currículo COMPLETO e otimizado para ${p.nome}.

## PERFIL:
- Nome: ${p.nome}
- Cargo: ${p.cargo}
- Área: ${p.area}
- Experiência: ${p.experiencia} anos
- Especializações: ${p.especializacoes || 'não informado'}
- Certificações: ${p.certificacoes || 'não informado'}
- Setor: ${p.setor}
- Objetivo: ${p.objetivo}
- Cidade: ${p.cidade}
- Salário desejado: ${p.salario || 'não informado'}

## ENTREGUE:

### 📄 CURRÍCULO COMPLETO (pronto para usar)

**CABEÇALHO:**
[Nome completo]
[Cargo pretendido] | [Cidade, Estado]
[Email] | [Telefone] | [LinkedIn] | [Portfolio se aplicável]

**RESUMO EXECUTIVO (4-5 linhas):**
[Escreva o resumo completo e poderoso]

**COMPETÊNCIAS TÉCNICAS:**
[Organize em categorias relevantes para ${p.area}]

**EXPERIÊNCIA PROFISSIONAL:**
Para cada posição, use formato:
EMPRESA | CARGO | Período
• [Bullet CAR com métrica]
• [Bullet CAR com métrica]
• [Bullet CAR com métrica]

**FORMAÇÃO ACADÊMICA:**
[Estrutura otimizada]

**CERTIFICAÇÕES E CURSOS:**
[Listagem estratégica]

**IDIOMAS:**

---

### 🤖 ANÁLISE ATS
**Score ATS estimado:** X/100
**30 palavras-chave que DEVEM aparecer:**
[Lista numerada]

**Erros comuns de ATS que você deve evitar:**
[Lista]

**Formato correto do arquivo:**
[Instruções de formatação]`,

  entrevistas: (p) => `Você é um coach de carreira sênior especializado em preparação para entrevistas. Crie um guia completo e personalizado para ${p.nome}.

## PERFIL:
- Nome: ${p.nome}
- Cargo: ${p.cargo}
- Área: ${p.area}
- Experiência: ${p.experiencia} anos
- Objetivo: ${p.objetivo}
- Cidade: ${p.cidade}
- Salário desejado: ${p.salario || 'não informado'}

## ENTREGUE:

### 🎯 30 PERGUNTAS + RESPOSTAS MODELO

Para cada pergunta, forneça:
**PERGUNTA [n]: "[pergunta]"**
- 🧠 Por que perguntam: [razão]
- ⭐ Estrutura ideal: [STAR ou outra]
- ✅ Resposta modelo completa (personalizada para o perfil):
- ❌ Erros a evitar:

Inclua:
- 10 perguntas comportamentais clássicas
- 8 perguntas técnicas para ${p.area}
- 5 perguntas sobre carreira e motivação
- 4 perguntas situacionais difíceis
- 3 perguntas sobre salário e expectativas

### 💡 5 PERGUNTAS PARA FAZER AO ENTREVISTADOR
Perguntas estratégicas que demonstram preparo e interesse.

### 💰 NEGOCIAÇÃO SALARIAL
- Faixa de mercado para ${p.cargo} em ${p.cidade}
- Quando e como trazer o assunto
- Scripts de negociação (3 cenários)
- O que pedir além do salário (benefícios, bônus, stock options)
- Como responder "Qual sua pretensão salarial?"

### ✅ CHECKLIST PRÉ-ENTREVISTA
**48h antes:**
**No dia:**
**1 hora antes:**
**Entrevista online específico:**
**Entrevista presencial específico:**

### 📧 FOLLOW-UP PERFEITO
Templates de e-mail/mensagem para:
- Após a entrevista (até 24h)
- Se não receber retorno (7 dias)
- Agradecimento pela oferta`
};

app.post('/api/generate', async (req, res) => {
  try {
    const { module, profile } = req.body;

    if (!module || !profile) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    const promptFn = MODULE_PROMPTS[module];
    if (!promptFn) {
      return res.status(400).json({ error: 'Módulo não encontrado' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada. Adicione a variável de ambiente.' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'Você é um especialista em carreira e LinkedIn para o mercado brasileiro. Sempre responda em português do Brasil. Use formatação Markdown rica com emojis, tabelas e listas para tornar o conteúdo visual e fácil de ler. Seja específico, prático e entregue conteúdo pronto para usar.',
      messages: [{ role: 'user', content: promptFn(profile) }]
    });

    res.json({ content: message.content[0].text });
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    console.error('Claude API error:', status, error.message);
    let msg = 'Erro ao gerar conteúdo. Tente novamente em alguns segundos.';
    if (status === 401) msg = 'API Key inválida. Verifique a variável ANTHROPIC_API_KEY.';
    else if (status === 403) msg = 'Sem permissão. Verifique se sua conta Anthropic tem créditos e billing configurado.';
    else if (status === 429) msg = 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
    else if (status === 400) msg = `Requisição inválida: ${error.message}`;
    res.status(500).json({ error: msg, code: status });
  }
});

app.post('/api/plano90dias', async (req, res) => {
  try {
    const { profile, completedModules } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' });
    }

    const prompt = `Você é um coach de carreira sênior. Crie um Plano de Ação de 90 Dias DETALHADO e personalizado para ${profile.nome} conseguir ${profile.objetivo} na área de ${profile.area}.

## PERFIL:
- Cargo: ${profile.cargo}
- Área: ${profile.area}
- Objetivo: ${profile.objetivo}
- Cidade: ${profile.cidade}
- Modalidade: ${profile.modalidade}
- Módulos completados: ${completedModules.join(', ')}

## ENTREGUE:

### 🗓️ PLANO SEMANA A SEMANA (12 semanas)

Para cada semana:
**SEMANA [n] — [Tema da semana]**
- 🎯 Meta da semana: [objetivo mensurável]
- Segunda: [ação específica]
- Terça: [ação específica]
- Quarta: [ação específica]
- Quinta: [ação específica]
- Sexta: [ação específica]
- 📊 Métrica de sucesso: [o que medir]
- 💡 Dica motivacional:

### 🏆 MARCOS IMPORTANTES
**Fim do Mês 1 (semanas 1-4):**
Você deve ter alcançado:

**Fim do Mês 2 (semanas 5-8):**
Você deve ter alcançado:

**Fim do Mês 3 (semanas 9-12) — META FINAL:**
Você deve ter conseguido:

### 📈 KPIs SEMANAIS PARA ACOMPANHAR
| Métrica | Meta Semana 1 | Meta Semana 4 | Meta Semana 8 | Meta Semana 12 |
|---------|--------------|--------------|--------------|----------------|
| Conexões novas no LinkedIn | | | | |
| Mensagens enviadas | | | | |
| Candidaturas | | | | |
| Entrevistas | | | | |
| Posts publicados | | | | |

### 🆘 PLANO DE CONTINGÊNCIA
**Se no mês 1 não tiver nenhuma entrevista:**
[ações específicas]

**Se no mês 2 não receber ofertas:**
[ações específicas]

**Como manter a motivação:**
[estratégias práticas]

### ⚡ AÇÕES PARA AMANHÃ
As 5 primeiras coisas para fazer amanhã cedo:
1.
2.
3.
4.
5.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: 'Você é um coach de carreira sênior especializado no mercado brasileiro. Responda em português do Brasil com formatação Markdown rica. Seja específico, use datas, horários sugeridos e ações concretas. O plano deve ser motivador e realista.',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ content: message.content[0].text });
  } catch (error) {
    console.error('Claude API error:', error.message);
    res.status(500).json({ error: 'Erro ao gerar plano. Tente novamente.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ LinkedIn Career Agent rodando em http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY não definida! Copie .env.example para .env e adicione sua chave.');
  }
});
