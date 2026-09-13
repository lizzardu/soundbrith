/* ============================================================================
   SOUNDBIRTH — ligação à base de dados (Supabase)
   ============================================================================
   Incluir em cada página, por esta ordem:
     <script src="../assets/js/vendor/supabase.js"></script>
     <script src="../assets/js/supabase-config.js"></script>
     <script src="../assets/js/supabase-client.js"></script>

   Todas as funções de creicApi devolvem Promises. Os erros do Supabase são
   convertidos em mensagens em português antes de chegarem à página.
   ========================================================================= */

(function () {
  const cfg = window.CREIC_CONFIG || {};
  const configurado = !!cfg.SUPABASE_URL && !/SEU-PROJETO/.test(cfg.SUPABASE_URL)
                      && !!cfg.SUPABASE_ANON_KEY && !/cole-aqui/.test(cfg.SUPABASE_ANON_KEY);

  const sb = configurado ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  /* ---------- mensagens de erro legíveis ---------- */
  function traduzir(erro) {
    const m = (erro && (erro.message || erro.error_description || String(erro))) || 'Erro desconhecido.';
    const mapa = [
      [/Invalid login credentials/i, 'Email ou palavra-passe incorretos.'],
      [/Email not confirmed/i, 'Este email ainda não foi confirmado.'],
      [/User already registered/i, 'Já existe uma conta com este email.'],
      [/Password should be at least/i, 'A palavra-passe tem de ter pelo menos 8 caracteres.'],
      [/rate limit/i, 'Demasiadas tentativas seguidas. Espere um minuto e tente de novo.'],
      [/JWT expired|invalid JWT/i, 'A sessão expirou. Entre de novo.'],
      [/row-level security|violates row-level/i, 'Sem permissão para esta operação.'],
      [/duplicate key value.*processo/i, 'Já existe um doente com esse número de processo.'],
      [/Failed to fetch|NetworkError/i, 'Sem ligação ao servidor. Verifique a internet.']
    ];
    for (const [re, txt] of mapa) if (re.test(m)) return new Error(txt);
    return new Error(m);
  }

  async function q(promessa) {
    const { data, error } = await promessa;
    if (error) throw traduzir(error);
    return data;
  }

  function exigirCliente() {
    if (!sb) throw new Error('A plataforma ainda não está ligada à base de dados: preencha assets/js/supabase-config.js.');
  }

  async function uid() {
    const { data } = await sb.auth.getSession();
    return data.session ? data.session.user.id : null;
  }

  const api = {
    configurado,
    cliente: sb,
    traduzir,

    /* =====================================================================
       SESSÃO E CONTAS
       ===================================================================== */
    async login(email, password) {
      exigirCliente();
      await q(sb.auth.signInWithPassword({ email: email.trim(), password }));
      return this.sessao();
    },

    async logout() {
      if (sb) await sb.auth.signOut();
    },

    /** Sessão + contexto (papel, doente, grupo). null se não houver sessão. */
    async sessao() {
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      if (!data.session) return null;
      const ctx = await q(sb.rpc('meu_contexto'));
      return Object.assign({ user: data.session.user, email: data.session.user.email }, ctx || {});
    },

    /** Página de destino conforme o contexto da sessão (relativa à raiz). */
    destino(s) {
      if (!s) return 'index.html#acesso';
      if (!s.papel) return 'ativar-conta.html';
      if (s.papel === 'profissional') return 'area-profissional/dashboard.html';
      return s.grupo === 'pediatrico' ? 'area-pediatrica/dashboard.html' : 'area-adulto/dashboard.html';
    },

    /**
     * Ativação da conta do utilizador: entra (ou cria a conta) com o email do
     * convite e depois troca o código pelo perfil. Pode repetir-se sem estragar
     * nada — se o código falhar, a conta fica criada à espera de um código válido.
     */
    async ativarConta(email, password, codigo) {
      exigirCliente();
      email = email.trim().toLowerCase();
      const entrar = await sb.auth.signInWithPassword({ email, password });
      if (entrar.error) {
        if (!/Invalid login credentials/i.test(entrar.error.message)) throw traduzir(entrar.error);
        const criar = await sb.auth.signUp({ email, password });
        if (criar.error) throw traduzir(criar.error);
        if (!criar.data.session) {
          throw new Error('Este email já tem conta com outra palavra-passe, ou o projeto exige confirmação por email. Fale com a equipa.');
        }
      }
      return q(sb.rpc('ativar_conta', { p_codigo: codigo }));
    },

    async alterarPassword(nova) {
      exigirCliente();
      return q(sb.auth.updateUser({ password: nova }));
    },

    /* =====================================================================
       DOENTES
       ===================================================================== */
    listarDoentes() {
      exigirCliente();
      return q(sb.from('v_estado_doente').select('*').order('nome'));
    },

    obterEstado(doenteId) {
      return q(sb.from('v_estado_doente').select('*').eq('doente_id', doenteId).maybeSingle());
    },

    obterDoente(doenteId) {
      return q(sb.from('doentes').select('*').eq('id', doenteId).single());
    },

    async criarDoente(dados, preferencias) {
      exigirCliente();
      const d = await q(sb.from('doentes').insert(Object.assign({ criado_por: await uid() }, dados)).select().single());
      await q(sb.from('preferencias_comunicacao').insert(Object.assign({ doente_id: d.id }, preferencias || {})));
      return d;
    },

    atualizarDoente(doenteId, campos) {
      return q(sb.from('doentes').update(campos).eq('id', doenteId).select().single());
    },

    obterPreferencias(doenteId) {
      return q(sb.from('preferencias_comunicacao').select('*').eq('doente_id', doenteId).maybeSingle());
    },

    guardarPreferencias(doenteId, campos) {
      return q(sb.from('preferencias_comunicacao')
        .upsert(Object.assign({ doente_id: doenteId }, campos), { onConflict: 'doente_id' }).select().single());
    },

    /* =====================================================================
       CONTAS DE UTILIZADOR E CONVITES
       ===================================================================== */
    criarConvite(doenteId, email, nome, relacao) {
      return q(sb.rpc('criar_convite', { p_doente_id: doenteId, p_email: email, p_nome: nome, p_relacao: relacao }));
    },

    listarConvites(doenteId) {
      return q(sb.from('convites').select('id,email,nome_titular,relacao,expira_em,usado_em,criado_em')
        .eq('doente_id', doenteId).order('criado_em', { ascending: false }));
    },

    listarContas(doenteId) {
      return q(sb.from('perfis').select('id,nome,relacao,criado_em').eq('doente_id', doenteId).order('criado_em'));
    },

    removerConta(perfilId) {
      return q(sb.from('perfis').delete().eq('id', perfilId));
    },

    /* =====================================================================
       JORNADA
       ===================================================================== */
    /** Etapas do grupo do doente, ordenadas, com o estado de cada uma. */
    async obterJornada(doenteId, grupo) {
      const [etapas, linhas] = await Promise.all([
        q(sb.from('etapas_modelo').select('*').eq('grupo', grupo).order('fase_ordem').order('ordem')),
        q(sb.from('jornada_doente').select('*').eq('doente_id', doenteId))
      ]);
      const porEtapa = Object.fromEntries(linhas.map(l => [l.etapa_id, l]));
      const fases = [];
      for (const e of etapas) {
        let f = fases.find(x => x.fase_ordem === e.fase_ordem);
        if (!f) { f = { fase: e.fase, fase_curta: e.fase_curta, fase_ordem: e.fase_ordem, etapas: [] }; fases.push(f); }
        f.etapas.push(Object.assign({}, e, { registo: porEtapa[e.id] || null }));
      }
      return fases;
    },

    atualizarEtapa(jornadaId, campos) {
      return q(sb.from('jornada_doente').update(campos).eq('id', jornadaId).select().single());
    },

    /* =====================================================================
       MARCAÇÕES
       ===================================================================== */
    listarMarcacoes(doenteId) {
      return q(sb.from('marcacoes').select('*').eq('doente_id', doenteId)
        .order('quando', { ascending: true, nullsFirst: true }));
    },

    async criarMarcacao(dados) {
      return q(sb.from('marcacoes').insert(Object.assign({ criado_por: await uid() }, dados)).select().single());
    },

    atualizarMarcacao(id, campos) {
      return q(sb.from('marcacoes').update(campos).eq('id', id).select().single());
    },

    /** Pedido de consulta feito pelo próprio utilizador. */
    async pedirConsulta(doenteId, motivo) {
      return q(sb.from('marcacoes').insert({
        doente_id: doenteId, tipo: 'Pedido de consulta', estado: 'pedido', origem: 'utilizador',
        motivo, criado_por: await uid()
      }).select().single());
    },

    pedirApoio(marcacaoId, apoios) {
      return q(sb.rpc('pedir_apoio_marcacao', { p_marcacao_id: marcacaoId, p_apoios: apoios }));
    },

    /* =====================================================================
       MENSAGENS
       ===================================================================== */
    listarMensagens(doenteId) {
      return q(sb.from('mensagens').select('*').eq('doente_id', doenteId).order('criado_em'));
    },

    async enviarMensagem(doenteId, texto, { papel, nome, urgente }) {
      return q(sb.from('mensagens').insert({
        doente_id: doenteId, autor_id: await uid(), autor_nome: nome,
        papel_autor: papel, texto: texto.trim(), urgente: !!urgente
      }).select().single());
    },

    marcarMensagensLidas(doenteId) {
      return q(sb.rpc('marcar_mensagens_lidas', { p_doente_id: doenteId }));
    },

    /* =====================================================================
       QUESTIONÁRIOS
       ===================================================================== */
    catalogo(grupo) {
      let pedido = sb.from('questionarios').select('*').eq('ativo', true).order('nucleo', { ascending: false }).order('sigla');
      if (grupo) pedido = pedido.in('grupo', [grupo, 'ambos']);
      return q(pedido);
    },

    listarPedidos(doenteId) {
      return q(sb.from('pedidos_questionario').select('*, questionarios(*)').eq('doente_id', doenteId)
        .order('enviado_em', { ascending: false }));
    },

    async enviarPedido(doenteId, questionarioId, momento, respondente, prazo) {
      return q(sb.from('pedidos_questionario').insert({
        doente_id: doenteId, questionario_id: questionarioId, momento, respondente,
        prazo: prazo || null, enviado_por: await uid()
      }).select().single());
    },

    cancelarPedido(pedidoId) {
      return q(sb.from('pedidos_questionario').update({ estado: 'cancelado' }).eq('id', pedidoId));
    },

    responder(pedidoId, respostas, pontuacao, subescalas) {
      return q(sb.rpc('responder_questionario', {
        p_pedido_id: pedidoId, p_respostas: respostas || null,
        p_pontuacao: pontuacao == null ? null : pontuacao, p_subescalas: subescalas || null
      }));
    },

    listarRespostas(doenteId) {
      return q(sb.from('respostas_questionario').select('*, questionarios(sigla,nome,mcid,normas,definicao)')
        .eq('doente_id', doenteId).order('criado_em', { ascending: false }));
    },

    /* =====================================================================
       AUDIOLOGIA, PROGRAMAÇÕES E PROCESSADORES
       ===================================================================== */
    listarAvaliacoes(doenteId) {
      return q(sb.from('avaliacoes_audiologicas').select('*').eq('doente_id', doenteId).order('data'));
    },
    async registarAvaliacao(dados) {
      return q(sb.from('avaliacoes_audiologicas').insert(Object.assign({ criado_por: await uid() }, dados)).select().single());
    },

    listarProgramacoes(doenteId) {
      return q(sb.from('programacoes').select('*').eq('doente_id', doenteId).order('data'));
    },
    async registarProgramacao(dados) {
      return q(sb.from('programacoes').insert(Object.assign({ criado_por: await uid() }, dados)).select().single());
    },

    listarProcessadores(doenteId) {
      return q(sb.from('processadores').select('*').eq('doente_id', doenteId).order('entregue_em', { ascending: false }));
    },
    registarProcessador(dados) {
      return q(sb.from('processadores').insert(dados).select().single());
    },
    atualizarProcessador(id, campos) {
      return q(sb.from('processadores').update(campos).eq('id', id).select().single());
    },

    /* =====================================================================
       REABILITAÇÃO
       ===================================================================== */
    listarExercicios(doenteId, soAtivos) {
      let p = sb.from('exercicios').select('*').eq('doente_id', doenteId).order('criado_em');
      if (soAtivos) p = p.eq('ativo', true);
      return q(p);
    },
    async criarExercicio(dados) {
      return q(sb.from('exercicios').insert(Object.assign({ criado_por: await uid() }, dados)).select().single());
    },
    atualizarExercicio(id, campos) {
      return q(sb.from('exercicios').update(campos).eq('id', id));
    },

    /** Registos dos últimos 7 dias (incluindo hoje). */
    registosSemana(doenteId) {
      const desde = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
      return q(sb.from('registos_exercicio').select('*').eq('doente_id', doenteId).gte('data', desde));
    },
    async registarExercicioHoje(exercicioId, doenteId) {
      return q(sb.from('registos_exercicio').upsert(
        { exercicio_id: exercicioId, doente_id: doenteId, data: hojeISO(), registado_por: await uid() },
        { onConflict: 'exercicio_id,data', ignoreDuplicates: true }));
    },

    listarDiario(doenteId) {
      return q(sb.from('diario').select('*').eq('doente_id', doenteId).order('criado_em', { ascending: false }).limit(20));
    },
    async escreverDiario(doenteId, campos) {
      return q(sb.from('diario').insert(Object.assign({ doente_id: doenteId, autor_id: await uid() }, campos)));
    },

    listarMarcos(doenteId) {
      return q(sb.from('marcos_linguagem').select('*').eq('doente_id', doenteId)
        .order('idade_auditiva_alvo_meses', { ascending: true, nullsFirst: false }));
    },
    criarMarco(dados) {
      return q(sb.from('marcos_linguagem').insert(dados).select().single());
    },
    async marcarMarco(id, data) {
      return q(sb.from('marcos_linguagem').update({ atingido_em: data, confirmado_por: data ? await uid() : null }).eq('id', id));
    },

    /* =====================================================================
       RESULTADOS SOCIAIS, DECISÕES, ALERTAS, INDICADORES
       ===================================================================== */
    listarResultadosSociais(doenteId) {
      return q(sb.from('resultados_sociais').select('*').eq('doente_id', doenteId).order('data', { ascending: false }));
    },
    async registarResultadoSocial(dados) {
      return q(sb.from('resultados_sociais').insert(Object.assign({ registado_por: await uid() }, dados)));
    },

    listarDecisoes(doenteId) {
      let p = sb.from('decisoes_candidatura').select('*, doentes(nome,processo,grupo)').order('data_reuniao', { ascending: false });
      if (doenteId) p = p.eq('doente_id', doenteId);
      return q(p);
    },
    async registarDecisao(dados) {
      return q(sb.from('decisoes_candidatura').insert(Object.assign({ registado_por: await uid() }, dados)).select().single());
    },

    listarAlertas(doenteId) {
      let p = sb.from('v_alertas').select('*').order('desde', { ascending: true });
      if (doenteId) p = p.eq('doente_id', doenteId);
      return q(p);
    },
    async tratarAlerta(chave, doenteId, nota) {
      return q(sb.from('alertas_tratados').insert({ chave, doente_id: doenteId, nota: nota || null, tratado_por: await uid() }));
    },

    indicadores() {
      return q(sb.rpc('indicadores_centro'));
    }
  };

  function hojeISO() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  }

  /* =======================================================================
     PONTUAÇÃO DOS QUESTIONÁRIOS
     Recebe a definição (questionarios.definicao) e as respostas {item: valor}.
     Devolve { pontuacao, subescalas }. Os métodos são provisórios para os
     instrumentos com itens de demonstração: a regra oficial de cada um tem
     de substituir estes cálculos quando a versão licenciada for carregada.
     ======================================================================= */
  function pontuar(def, respostas) {
    const itens = (def && def.itens) || [];
    const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
    const r1 = x => x == null ? null : Math.round(x * 10) / 10;
    const valor = it => { const v = respostas[it.id]; return v === undefined || v === null || v === '' ? null : Number(v); };

    if (def.metodo === 'murqol') {
      const sec = s => media(itens.filter(i => i.seccao === s).map(valor).filter(v => v != null));
      const f = sec('frequencia'), imp = sec('importancia');
      // fator de reabilitação (Frosolini et al., 2022): importância − frequência,
      // só quando a importância é ≥ 2 e maior do que a frequência
      const fator = (imp != null && f != null && imp >= 2 && imp > f) ? imp - f : 0;
      return { pontuacao: null, subescalas: { frequencia: r1(f), importancia: r1(imp), fator_reabilitacao: Math.round(fator * 100) / 100 } };
    }

    if (def.metodo === 'aphab') {
      // A=99% … G=1% de problema; itens positivos invertem-se. Global = média EC, BN, RV.
      const perc = [99, 87, 75, 50, 25, 12, 1];
      const porSub = {};
      for (const it of itens) {
        const v = valor(it); if (v == null) continue;
        let p = perc[v - 1]; if (it.invertido) p = 100 - p;
        (porSub[it.subescala] = porSub[it.subescala] || []).push(p);
      }
      const sub = {}; for (const k in porSub) sub[k] = r1(media(porSub[k]));
      const glob = media(['EC', 'BN', 'RV'].map(k => sub[k]).filter(v => v != null));
      sub.global = r1(glob);
      return { pontuacao: r1(glob), subescalas: sub };
    }

    const esc = def.escala || { min: 0, max: 1 };
    const transf = v => def.metodo === 'media_0_100' ? (v - esc.min) / (esc.max - esc.min) * 100 : v;
    const porSub = {}, todos = [];
    for (const it of itens) {
      const v = valor(it); if (v == null) continue;
      const t = transf(v);
      todos.push(t);
      if (it.subescala) (porSub[it.subescala] = porSub[it.subescala] || []).push(t);
    }
    const agrega = a => def.metodo === 'soma' ? a.reduce((s, x) => s + x, 0) : media(a);
    const sub = {};
    for (const k in porSub) sub[k] = r1(agrega(porSub[k]));
    const glob = r1(agrega(todos));
    sub.global = glob;
    return { pontuacao: glob, subescalas: sub };
  }

  api.pontuar = pontuar;
  api.hojeISO = hojeISO;
  window.creicApi = api;
})();
