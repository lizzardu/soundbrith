/* ========================================================================
   SOUNDBIRTH — ficha do doente (área profissional)
   Tudo o que a equipa faz com um doente passa por aqui. Cada separador
   carrega os seus dados quando é aberto.
   ======================================================================== */

(function () {
  const F = { id: new URLSearchParams(location.search).get('id'), sessao: null, doente: null, prefs: null, catalogo: null };
  const $ = id => document.getElementById(id);

  const MOMENTOS = {
    basal: 'Basal', ativacao: 'Ativação', anual: 'Anual', bienal: 'A cada 2 anos',
    candidatura_antes_aconselhamento: 'Candidatura — antes do aconselhamento',
    candidatura_depois_aconselhamento: 'Candidatura — depois do aconselhamento',
    prova_protese_inicio: 'Início da prova de próteses', prova_protese_fim: 'Fim da prova de próteses',
    upgrade_antes: 'Atualização — processador antigo', upgrade_depois: 'Atualização — 4 semanas com o novo',
    pre_cirurgia: 'Antes da cirurgia', apos_marco: 'Após um marco do percurso',
    inicio_ano_letivo: 'Início do ano letivo', fim_ano_letivo: 'Fim do ano letivo', com_protese: 'Com prótese',
    '1sem': '1 semana', extra: 'Extra'
  };
  const momento = m => MOMENTOS[m] || (/^\d+m$/.test(m) ? parseInt(m) + ' meses' : (/^\d+a$/.test(m) ? parseInt(m) + ' anos' : m));

  const SOCIAL = {
    situacao_profissional: { tempo_inteiro: 'Emprego a tempo inteiro', tempo_parcial: 'Emprego a tempo parcial', desempregado: 'Desempregado(a)', baixa: 'De baixa', reformado: 'Reformado(a)', estudante: 'Estudante', outra: 'Outra' },
    escolaridade: { creche: 'Creche', pre_escolar: 'Pré-escolar', regular_sem_apoio: 'Ensino regular sem apoio', regular_com_apoio: 'Ensino regular com apoio', bilingue: 'Ensino bilingue', especial: 'Ensino especial', superior: 'Ensino superior', nao_aplicavel: 'Não aplicável' }
  };
  const DECISAO = { candidato: 'Candidato a implante', nao_candidato: 'Não candidato', adiar: 'Adiar — completar estudo', rever: 'Rever mais tarde' };

  /* ---------------------------------------------------------------------
     arranque
     --------------------------------------------------------------------- */
  async function iniciar() {
    F.sessao = await iniciarPagina();
    if (!F.sessao) return;
    if (!F.id) { $('cabecalho').innerHTML = erroHTML('Falta indicar o doente. Abra a ficha a partir da lista.'); return; }
    try {
      await carregarBase();
      pintarTabs();
      abrir(location.hash.slice(1) || 'percurso');
    } catch (e) {
      $('cabecalho').innerHTML = erroHTML(e);
    }
  }

  async function carregarBase() {
    const [doente, prefs, estado, alertas] = await Promise.all([
      creicApi.obterDoente(F.id), creicApi.obterPreferencias(F.id),
      creicApi.obterEstado(F.id), creicApi.listarAlertas(F.id)
    ]);
    Object.assign(F, { doente, prefs, estado, alertas });
    document.title = doente.nome + ' — SoundBirth · CREIC';
    pintarCabecalho();
    pintarComunicacao();
    pintarAlertas();
  }

  function pintarCabecalho() {
    const d = F.doente, e = F.estado || {};
    const idadeAud = d.data_ativacao ? mesesEntre(d.data_ativacao) : null;
    $('cabecalho').innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-end;">
        <div>
          <h1 style="font-size:1.8rem; margin-bottom:6px;">${esc(d.nome)}
            <span class="pill ${d.grupo === 'pediatrico' ? 'pill-sign' : 'pill-wave'}" style="vertical-align:middle;">${ROTULOS.grupo[d.grupo]}</span>
            ${d.estado !== 'ativo' ? `<span class="pill pill-warn" style="vertical-align:middle;">${esc(d.estado)}</span>` : ''}
          </h1>
          <p class="mono hint" style="margin:0;">
            ${esc(d.processo)} · ${idadeTexto(d.data_nascimento)}
            ${d.lado_implante !== 'nenhum' ? ' · implante ' + esc(d.lado_implante) : ''}
            ${idadeAud != null ? ' · idade auditiva ' + mesesTexto(idadeAud) : ''}
          </p>
          ${d.etiologia ? `<p class="hint" style="margin:4px 0 0;">${esc(d.etiologia)}</p>` : ''}
        </div>
        <div style="text-align:right;">
          <span class="hint">Em curso</span><br>
          <strong style="color:var(--deep);">${e.etapa_titulo ? esc(e.etapa_titulo) : '—'}</strong><br>
          <span class="hint mono">${e.etapas_feitas || 0} de ${e.etapas_total || 0} etapas feitas</span>
        </div>
      </div>`;
  }

  function pintarComunicacao() {
    const p = F.prefs || {};
    const canais = { plataforma: 'Mensagem na plataforma', sms: 'SMS', email: 'Email', video_legendado: 'Videochamada legendada', video_lgp: 'Videochamada em LGP' };
    const lista = (p.canais || []).map(c => canais[c] || c).join(' · ') || '—';
    const proibido = (p.canais_proibidos || []).includes('chamada_telefonica');
    $('comunicacao').innerHTML = `
      <div class="card" style="margin-top:18px; border-left:4px solid var(--sign); padding:18px 22px;">
        <p class="eyebrow" style="color:var(--sign);">Antes de contactar</p>
        <div class="grid g-3" style="gap:14px;">
          <div><strong style="font-size:.86rem;">Canais preferidos</strong><p style="font-size:.86rem; color:var(--ink-soft); margin:2px 0 0;">${esc(lista)}</p></div>
          <div><strong style="font-size:.86rem; color:${proibido ? 'var(--alert)' : 'var(--ink)'};">${proibido ? 'Nunca telefonar' : 'Telefone'}</strong>
            <p style="font-size:.86rem; color:var(--ink-soft); margin:2px 0 0;">${proibido ? 'Chamada telefónica proibida no perfil' : 'Sem restrição registada'}</p></div>
          <div><strong style="font-size:.86rem;">Na consulta</strong>
            <p style="font-size:.86rem; color:var(--ink-soft); margin:2px 0 0;">${[
              p.usa_lgp && 'utiliza LGP', p.precisa_interprete && '<strong>precisa de intérprete</strong>',
              p.leitura_labial && 'leitura labial eficaz', p.linguagem_simples && 'linguagem simples'
            ].filter(Boolean).join(' · ') || '—'}</p></div>
        </div>
        ${p.notas ? `<p class="hint" style="margin:10px 0 0;">${esc(p.notas)}</p>` : ''}
        <details class="bloco">
          <summary>Editar preferências</summary>
          <form onsubmit="Ficha.guardarPreferencias(event)">
            <div class="chip-group" style="margin-bottom:10px;">
              ${Object.entries(canais).map(([v, t]) => `<label class="chip"><input type="checkbox" name="canais" value="${v}" ${(p.canais || []).includes(v) ? 'checked' : ''}><span>${t}</span></label>`).join('')}
            </div>
            <div class="chip-group" style="margin-bottom:10px;">
              <label class="chip"><input type="checkbox" name="proibir" ${proibido ? 'checked' : ''}><span>Nunca telefonar</span></label>
              <label class="chip"><input type="checkbox" name="usa_lgp" ${p.usa_lgp ? 'checked' : ''}><span>Utiliza LGP</span></label>
              <label class="chip"><input type="checkbox" name="precisa_interprete" ${p.precisa_interprete ? 'checked' : ''}><span>Precisa de intérprete</span></label>
              <label class="chip"><input type="checkbox" name="leitura_labial" ${p.leitura_labial ? 'checked' : ''}><span>Leitura labial</span></label>
              <label class="chip"><input type="checkbox" name="linguagem_simples" ${p.linguagem_simples ? 'checked' : ''}><span>Linguagem simples</span></label>
            </div>
            <div class="field"><label>Notas</label><input type="text" name="notas" value="${esc(p.notas || '')}"></div>
            <button class="btn btn-primary btn-sm" type="submit">Guardar preferências</button>
          </form>
        </details>
      </div>`;
  }

  function pintarAlertas() {
    if (!F.alertas.length) { $('alertas-doente').innerHTML = ''; return; }
    $('alertas-doente').innerHTML = `<div class="card" style="margin-top:14px; padding:14px 20px;">
      <p class="eyebrow" style="color:var(--alert);">Alertas deste doente</p>
      ${F.alertas.map(a => `<div class="linha-acao">
        <div class="corpo"><span class="pill ${ROTULOS.nivel[a.nivel]}">${esc(a.nivel)}</span>
          <strong style="font-size:.9rem; margin-left:6px;">${esc(a.titulo)}</strong>
          <p class="hint" style="margin:4px 0 0;">${esc(a.detalhe)}</p></div>
        <div class="acoes"><button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.tratarAlerta('${esc(a.chave)}')">Marcar como tratado</button></div>
      </div>`).join('')}
    </div>`;
  }

  /* ---------------------------------------------------------------------
     separadores
     --------------------------------------------------------------------- */
  function tabs() {
    const ped = F.doente.grupo === 'pediatrico';
    return [
      ['percurso', 'Percurso', tabPercurso],
      ['acesso', 'Contas e acesso', tabAcesso],
      ['marcacoes', 'Marcações', tabMarcacoes],
      ['questionarios', 'Questionários', tabQuestionarios],
      ['audiologia', 'Audiologia', tabAudiologia],
      ['dispositivo', 'Dispositivo e programação', tabDispositivo],
      ['reabilitacao', ped ? 'Reabilitação e linguagem' : 'Reabilitação', tabReabilitacao],
      ['sociais', ped ? 'Escola' : 'Trabalho', tabSociais],
      ['decisoes', 'Decisões', tabDecisoes],
      ['mensagens', 'Mensagens', tabMensagens],
      ['dados', 'Dados e grupo', tabDados]
    ];
  }

  function pintarTabs() {
    const porLer = (F.estado && F.estado.mensagens_por_ler) || 0;
    $('tabs').innerHTML = tabs().map(([id, txt]) =>
      `<button type="button" role="tab" data-tab="${id}" onclick="Ficha.abrir('${id}')">${txt}${id === 'mensagens' && porLer ? ` <span class="pill pill-alert">${porLer}</span>` : ''}</button>`).join('');
  }

  async function abrir(id) {
    const t = tabs().find(x => x[0] === id) || tabs()[0];
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t[0]));
    history.replaceState(null, '', '#' + t[0]);
    $('painel').innerHTML = '<p class="hint">A carregar…</p>';
    try { await t[2](); } catch (e) { $('painel').innerHTML = erroHTML(e); }
  }

  async function recarregar() {
    await carregarBase();
    pintarTabs();
    await abrir(location.hash.slice(1) || 'percurso');
  }

  /* ===================================================================== PERCURSO */
  async function tabPercurso() {
    const fases = await creicApi.obterJornada(F.id, F.doente.grupo);
    F.fases = fases;
    const estados = ['previsto', 'ativo', 'feito', 'nao_aplicavel'];
    $('painel').innerHTML = `
      <div class="card"><div class="onda onda-light" id="onda"></div></div>
      <p class="hint" style="margin:14px 0;">Ao marcar uma etapa como feita, a seguinte passa a "em curso" se não houver outra em curso.
      O prazo de referência conta a partir do dia em que a etapa começou.</p>
      ${fases.map((f, i) => `
        <div class="card" style="margin-top:14px;">
          <div class="fase-head"><span class="fase-num">${i + 1}</span><h2 style="font-size:1.1rem;">${esc(f.fase)}</h2></div>
          ${f.etapas.map(e => {
            const r = e.registo;
            if (!r) return '';
            return `<form class="linha-acao" onsubmit="Ficha.guardarEtapa(event, '${r.id}')">
              <div class="corpo">
                <strong style="font-size:.92rem; color:var(--deep);">${esc(e.titulo)}</strong>
                <p class="hint" style="margin:2px 0 6px;">${esc(e.quem || '')}${e.prazo_texto ? ' · ' + esc(e.prazo_texto) : ''}
                  ${r.estado === 'ativo' && r.iniciada_em ? ' · em curso desde ' + fmtData(r.iniciada_em) : ''}</p>
                ${e.evidencia ? `<p class="evidencia" style="margin:0 0 6px;">${esc(e.evidencia)}</p>` : ''}
                <input type="text" name="observacoes" value="${esc(r.observacoes || '')}" placeholder="Observações" style="min-height:36px; padding:8px 10px; font-size:.84rem;">
              </div>
              <div class="acoes">
                <select name="estado" style="width:auto; min-height:36px; padding:6px 10px;">
                  ${estados.map(s => `<option value="${s}" ${r.estado === s ? 'selected' : ''}>${ROTULOS.estadoEtapa[s]}</option>`).join('')}
                </select>
                <input type="date" name="data_efetiva" value="${r.data_efetiva || ''}" title="Data em que foi feita" style="width:auto; min-height:36px; padding:6px 8px;">
                <button class="btn btn-ghost btn-sm" type="submit">Guardar</button>
              </div>
            </form>`;
          }).join('')}
        </div>`).join('')}`;
    desenharOnda('onda', fases);
  }

  async function guardarEtapa(ev, jornadaId) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.atualizarEtapa(jornadaId, {
        estado: f.estado.value, data_efetiva: f.data_efetiva.value || null, observacoes: f.observacoes.value.trim() || null
      });
      aviso('Etapa atualizada.');
      await recarregar();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== ACESSO */
  async function tabAcesso() {
    const [contas, convites] = await Promise.all([creicApi.listarContas(F.id), creicApi.listarConvites(F.id)]);
    const ped = F.doente.grupo === 'pediatrico';
    const estadoConvite = c => c.usado_em ? '<span class="pill pill-ok">ativado ' + fmtData(c.usado_em) + '</span>'
      : (new Date(c.expira_em) < new Date() ? '<span class="pill pill-warn">expirado</span>' : '<span class="pill pill-pending">à espera · expira ' + fmtData(c.expira_em) + '</span>');
    $('painel').innerHTML = `
      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Contas ativas</p>
          ${contas.length ? contas.map(c => `<div class="linha-acao">
            <div class="corpo"><strong>${esc(c.nome)}</strong><br><span class="hint">${esc(ROTULOS.relacao[c.relacao] || '')} · desde ${fmtData(c.criado_em)}</span></div>
            <div class="acoes"><button class="btn btn-ghost btn-sm" type="button" data-nome="${esc(c.nome)}" onclick="Ficha.removerConta('${c.id}', this.dataset.nome)">Retirar acesso</button></div>
          </div>`).join('') : vazio('Ainda ninguém ativou o acesso a este doente.')}
          <p class="eyebrow" style="margin-top:22px;">Convites</p>
          ${convites.length ? convites.map(c => `<div class="linha-acao">
            <div class="corpo"><strong style="font-size:.88rem;">${esc(c.email)}</strong><br><span class="hint">${esc(c.nome_titular)} · ${esc(ROTULOS.relacao[c.relacao] || '')} · criado ${fmtData(c.criado_em)}</span></div>
            <div class="acoes">${estadoConvite(c)}</div>
          </div>`).join('') : vazio('Sem convites.')}
        </div>
        <div class="card">
          <p class="eyebrow">Criar acesso</p>
          <p class="hint">${ped ? 'Numa criança, cada responsável tem a sua conta. A partir dos 16 anos pode criar-se uma para o próprio.' : 'A conta é do próprio doente.'}
          O código fica ligado ao email e expira em 7 dias; um novo convite para o mesmo email anula o anterior.</p>
          <form onsubmit="Ficha.criarConvite(event)">
            <div class="field"><label>Email</label><input type="email" name="email" required></div>
            <div class="field"><label>Nome do titular</label><input type="text" name="nome" value="${ped ? '' : esc(F.doente.nome)}" required></div>
            <div class="field"><label>Relação</label>
              <select name="relacao">${Object.entries(ROTULOS.relacao).map(([v, t]) => `<option value="${v}" ${(ped ? 'mae' : 'proprio') === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
            <button class="btn btn-primary" type="submit">Gerar código</button>
          </form>
          <div id="novo-codigo"></div>
        </div>
      </div>`;
  }

  async function criarConvite(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      const codigo = await creicApi.criarConvite(F.id, f.email.value.trim(), f.nome.value.trim(), f.relacao.value);
      const email = f.email.value.trim();
      await tabAcesso();
      $('novo-codigo').innerHTML = `<p style="margin:16px 0 4px;"><strong>Código para ${esc(email)}</strong></p>
        <div class="codigo-convite">${esc(codigo)}</div>
        <p class="hint">Mostrado só agora. Entregue-o por escrito, pelo canal preferido registado.</p>`;
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function removerConta(id, nome) {
    if (!confirm('Retirar o acesso de ' + nome + '? A pessoa deixa de ver os dados deste doente. Pode voltar a convidá-la.')) return;
    try { await creicApi.removerConta(id); aviso('Acesso retirado.'); await tabAcesso(); } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== MARCAÇÕES */
  async function tabMarcacoes() {
    const lista = await creicApi.listarMarcacoes(F.id);
    const lgp = F.prefs && (F.prefs.usa_lgp || F.prefs.precisa_interprete);
    const chipsApoio = (sel) => Object.entries(ROTULOS.apoio).map(([v, t]) =>
      `<label class="chip"><input type="checkbox" name="apoio" value="${v}" ${sel.includes(v) ? 'checked' : ''}><span>${t}</span></label>`).join('');
    const pedidos = lista.filter(m => m.estado === 'pedido');
    const outras = lista.filter(m => m.estado !== 'pedido');

    $('painel').innerHTML = `
      ${pedidos.length ? `<div class="card" style="border-color:var(--warn); margin-bottom:18px;">
        <p class="eyebrow" style="color:var(--warn);">Pedidos do utilizador</p>
        ${pedidos.map(m => `<form class="linha-acao" onsubmit="Ficha.marcarPedido(event, '${m.id}')">
          <div class="corpo"><strong>Pedido de ${fmtData(m.criado_em)}</strong><p style="font-size:.88rem; margin:4px 0 0;">${esc(m.motivo || 'Sem motivo indicado.')}</p></div>
          <div class="acoes">
            <input type="datetime-local" name="quando" required style="width:auto; min-height:36px; padding:6px 8px;">
            <input type="text" name="tipo" placeholder="Tipo de consulta" required style="width:180px; min-height:36px; padding:6px 8px;">
            <button class="btn btn-primary btn-sm" type="submit">Marcar</button>
            <button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.estadoMarcacao('${m.id}', 'cancelada')">Recusar</button>
          </div>
        </form>`).join('')}
      </div>` : ''}

      <div class="card card-flush table-scroll">
        <table>
          <thead><tr><th>Quando</th><th>Consulta</th><th>Apoio</th><th>Estado</th></tr></thead>
          <tbody>${outras.length ? outras.map(m => `<tr>
            <td class="mono" style="font-size:.84rem;">${fmtDataHora(m.quando)}</td>
            <td><strong>${esc(m.tipo)}</strong><br><span class="hint">${esc([m.local, m.profissional].filter(Boolean).join(' · '))}</span></td>
            <td style="font-size:.82rem;">${(m.apoio_pedido || []).map(a => esc(ROTULOS.apoio[a] || a)).join('<br>') || '<span class="hint">—</span>'}
              ${(m.apoio_pedido || []).length ? `<br><label style="display:inline-flex; gap:6px; font-weight:500; margin-top:4px;">
                <input type="checkbox" ${m.apoio_garantido ? 'checked' : ''} onchange="Ficha.apoioGarantido('${m.id}', this.checked)"> garantido</label>` : ''}</td>
            <td><select style="width:auto; min-height:36px; padding:6px 10px;" onchange="Ficha.estadoMarcacao('${m.id}', this.value)">
              ${['marcada', 'confirmada', 'realizada', 'faltou', 'cancelada'].map(s => `<option value="${s}" ${m.estado === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select></td>
          </tr>`).join('') : `<tr><td colspan="4">${vazio('Sem marcações.')}</td></tr>`}</tbody>
        </table>
      </div>

      <details class="bloco" ${outras.length ? '' : 'open'}>
        <summary>Nova marcação</summary>
        <form onsubmit="Ficha.novaMarcacao(event)">
          <div class="form-grid">
            <div class="field"><label>Data e hora</label><input type="datetime-local" name="quando" required></div>
            <div class="field"><label>Tipo</label><input type="text" name="tipo" required placeholder="ex.: Programação do processador — 3 meses"></div>
            <div class="field"><label>Local</label><input type="text" name="local"></div>
            <div class="field"><label>Profissional / especialidade</label><input type="text" name="profissional"></div>
            <div class="field inteiro"><label>Apoio na consulta</label><div class="chip-group">${chipsApoio(lgp ? ['interprete_lgp'] : [])}</div>
              ${lgp ? '<p class="hint" style="margin-top:6px;">Pré-selecionado porque o perfil indica LGP ou necessidade de intérprete.</p>' : ''}</div>
            <div class="field"><label><input type="checkbox" name="garantido"> Apoio já garantido</label></div>
          </div>
          <button class="btn btn-primary" type="submit" style="margin-top:12px;">Criar marcação</button>
        </form>
      </details>`;
  }

  async function novaMarcacao(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.criarMarcacao({
        doente_id: F.id, quando: new Date(f.quando.value).toISOString(), tipo: f.tipo.value.trim(),
        local: valorForm(f, 'local'), profissional: valorForm(f, 'profissional'), estado: 'marcada',
        apoio_pedido: marcados(f, 'apoio'), apoio_garantido: f.garantido.checked
      });
      aviso('Marcação criada.');
      await tabMarcacoes();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function marcarPedido(ev, id) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.atualizarMarcacao(id, { quando: new Date(f.quando.value).toISOString(), tipo: f.tipo.value.trim(), estado: 'marcada' });
      aviso('Pedido marcado.');
      await recarregar();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function estadoMarcacao(id, estado) {
    try { await creicApi.atualizarMarcacao(id, { estado }); aviso('Estado atualizado.'); await recarregar(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  async function apoioGarantido(id, valor) {
    try { await creicApi.atualizarMarcacao(id, { apoio_garantido: valor }); aviso(valor ? 'Apoio marcado como garantido.' : 'Apoio por garantir.'); await carregarBase(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== QUESTIONÁRIOS */
  async function tabQuestionarios() {
    const [pedidos, respostas, catalogo] = await Promise.all([
      creicApi.listarPedidos(F.id), creicApi.listarRespostas(F.id),
      F.catalogo ? Promise.resolve(F.catalogo) : creicApi.catalogo(F.doente.grupo)
    ]);
    F.catalogo = catalogo;
    const pendentes = pedidos.filter(p => p.estado === 'pendente');

    $('painel').innerHTML = `
      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Por responder</p>
          ${pendentes.length ? pendentes.map(p => `<div class="linha-acao">
            <div class="corpo"><strong>${esc(p.questionarios.sigla)}</strong> · ${esc(momento(p.momento))}<br>
              <span class="hint">responde: ${esc(ROTULOS.respondente[p.respondente])} · enviado ${fmtData(p.enviado_em)}${p.prazo ? ' · prazo ' + fmtData(p.prazo) : ''}
              ${!p.questionarios.definicao ? ' · <strong>sem formulário online</strong>' : ''}</span></div>
            <div class="acoes">
              <button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.registarPontuacao('${p.id}', '${esc(p.questionarios.sigla)}')">Registar pontuação</button>
              <button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.cancelarPedido('${p.id}')">Cancelar</button>
            </div>
          </div>`).join('') : vazio('Nada por responder.')}
        </div>

        <div class="card">
          <p class="eyebrow">Enviar questionário</p>
          <form onsubmit="Ficha.enviarPedido(event)">
            <div class="field"><label>Instrumento</label>
              <select name="questionario" required onchange="Ficha.escolheuQuestionario(this.form)">
                <option value="">—</option>
                ${['prom', 'expectativas', 'prem'].map(tipo => {
                  const grupoQ = catalogo.filter(q => q.tipo === tipo);
                  if (!grupoQ.length) return '';
                  const rot = { prom: 'Resultados (PROMs)', expectativas: 'Expectativas', prem: 'Experiência (PREMs)' }[tipo];
                  return `<optgroup label="${rot}">${grupoQ.map(q => `<option value="${q.id}">${esc(q.sigla)}${q.nucleo ? ' · núcleo' : ''}${q.definicao ? '' : ' · pontuação manual'}</option>`).join('')}</optgroup>`;
                }).join('')}
              </select></div>
            <p class="hint" id="nota-questionario" style="margin-top:-12px;"></p>
            <div class="form-grid">
              <div class="field"><label>Momento</label><select name="momento" required><option value="">escolha o instrumento</option></select></div>
              <div class="field"><label>Quem responde</label>
                <select name="respondente">${Object.entries(ROTULOS.respondente).filter(([v]) => v !== 'clinico').map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
              <div class="field"><label>Prazo</label><input type="date" name="prazo"></div>
            </div>
            <button class="btn btn-primary" type="submit" style="margin-top:12px;">Enviar ao utilizador</button>
          </form>
        </div>
      </div>

      <div class="card" style="margin-top:20px;">
        <p class="eyebrow">Respostas</p>
        ${respostas.length ? blocoRespostas(respostas) : vazio('Ainda sem respostas.')}
      </div>`;
  }

  function escolheuQuestionario(f) {
    const q = F.catalogo.find(x => x.id === f.questionario.value);
    if (!q) return;
    f.momento.innerHTML = (q.momentos || []).map(m => `<option value="${esc(m)}">${esc(momento(m))}</option>`).join('')
      + '<option value="extra">Fora dos momentos previstos</option>';
    f.respondente.value = q.respondente;
    $('nota-questionario').innerHTML = `${esc(q.nome)} · ${q.itens_n || '?'} itens · ~${q.minutos || '?'} min<br>${esc(q.notas || '')}`
      + (q.definicao && q.definicao.demonstracao ? '<br><strong>Formulário com itens de demonstração.</strong>' : '');
  }

  function blocoRespostas(respostas) {
    const porQ = {};
    respostas.forEach(r => (porQ[r.questionario_id] = porQ[r.questionario_id] || []).push(r));
    return Object.entries(porQ).map(([qid, lista]) => {
      const q = lista[0].questionarios || {};
      const rot = (q.definicao && q.definicao.rotulos_subescalas) || {};
      let extra = '';

      // expectativas: cada domínio face à norma de utilizadores experientes
      if (qid === 'ciqol_exp') {
        extra = `<p class="hint" style="margin:10px 0 6px;">Comparação da última resposta com a média de 705 utilizadores experientes
          (CIQOL-35; McRackan et al., 2022). A amarelo, domínios acima da média + 1 DP.</p>
          <div id="exp-comparacao" class="dominios"></div>`;
        setTimeout(() => pintarExpectativas(lista[0]), 0);
      }

      // atualização do processador: antes vs 4 semanas depois, com a diferença mínima relevante
      if ((qid === 'aphab' || qid === 'apsq') && q.mcid) {
        const antes = lista.find(r => r.momento === 'upgrade_antes'), depois = lista.find(r => r.momento === 'upgrade_depois');
        if (antes && depois && antes.pontuacao != null && depois.pontuacao != null) {
          const delta = depois.pontuacao - antes.pontuacao;
          const melhora = qid === 'aphab' ? -delta >= q.mcid : delta >= q.mcid;   // APHAB: menos problema = melhor
          extra = `<div class="${melhora ? 'banner-info' : 'aviso-demo'}" style="margin-top:10px;">
            <span aria-hidden="true">${melhora ? '&#10003;' : '&#8505;'}</span>
            <span>Atualização do processador: ${num(antes.pontuacao)} → ${num(depois.pontuacao)} (Δ ${delta > 0 ? '+' : ''}${num(delta)}).
            ${melhora ? 'Benefício acima' : 'Abaixo'} da diferença mínima relevante de ${String(q.mcid).replace('.', ',')} (Lailach et al., 2023).</span></div>`;
        }
      }

      return `<div style="margin-bottom:22px;">
        <h3 style="font-size:1rem; margin-bottom:6px;">${esc(q.sigla || qid)} <span class="hint" style="font-family:var(--f-body);">${esc(q.nome || '')}</span></h3>
        <div class="table-scroll"><table>
          <thead><tr><th>Data</th><th>Momento</th><th>Respondeu</th><th>Pontuação</th><th>Domínios</th></tr></thead>
          <tbody>${lista.map(r => `<tr>
            <td class="mono" style="font-size:.82rem;">${fmtData(r.criado_em)}</td>
            <td style="font-size:.84rem;">${esc(momento(r.momento))}</td>
            <td style="font-size:.82rem;">${esc(ROTULOS.respondente[r.papel_respondente] || r.papel_respondente)}</td>
            <td class="mono">${num(r.pontuacao)}</td>
            <td style="font-size:.8rem; color:var(--ink-soft);">${r.subescalas ? Object.entries(r.subescalas).filter(([k]) => k !== 'global')
              .map(([k, v]) => esc(rot[k] || k.replace(/_/g, ' ')) + ' ' + num(v)).join(' · ') : '—'}</td>
          </tr>`).join('')}</tbody>
        </table></div>
        ${extra}
      </div>`;
    }).join('');
  }

  async function pintarExpectativas(resposta) {
    const el = $('exp-comparacao');
    if (!el || !resposta.subescalas) return;
    const cat = F.catalogo || await creicApi.catalogo(F.doente.grupo);
    const ciqol35 = cat.find(q => q.id === 'ciqol35');
    const normas = (ciqol35 && ciqol35.normas) || {};
    const rot = { comunicacao: 'Comunicação', emocional: 'Emocional', entretenimento: 'Entretenimento', ambiente: 'Ambiente', esforco_auditivo: 'Esforço auditivo', social: 'Social', global: 'Global' };
    el.innerHTML = Object.keys(rot).filter(k => resposta.subescalas[k] != null && normas[k]).map(k => {
      const v = resposta.subescalas[k], n = normas[k];
      const acima = v > n.media + n.dp;
      return `<div class="dominio ${acima ? 'acima' : ''}">
        <div class="n">${num(v)}</div>
        <div class="l">${rot[k]} · espera<br>típico ${num(n.media)} ± ${num(n.dp)}</div>
      </div>`;
    }).join('');
  }

  async function enviarPedido(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.enviarPedido(F.id, f.questionario.value, f.momento.value, f.respondente.value, f.prazo.value || null);
      aviso('Questionário enviado. Aparece na área do utilizador.');
      await recarregar();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function registarPontuacao(pedidoId, sigla) {
    const v = prompt('Pontuação global do ' + sigla + ' (use ponto ou vírgula para decimais):');
    if (v == null || v.trim() === '') return;
    const n = Number(v.replace(',', '.'));
    if (Number.isNaN(n)) { aviso('Valor inválido.', 'erro'); return; }
    try { await creicApi.responder(pedidoId, null, n, { global: n }); aviso('Pontuação registada.'); await recarregar(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  async function cancelarPedido(id) {
    if (!confirm('Cancelar este pedido de questionário?')) return;
    try { await creicApi.cancelarPedido(id); aviso('Pedido cancelado.'); await recarregar(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== AUDIOLOGIA */
  async function tabAudiologia() {
    const lista = await creicApi.listarAvaliacoes(F.id);
    const comProtese = [...lista].reverse().find(a => a.tonal && /protese/.test(a.condicao || a.momento || ''));
    const comImplante = [...lista].reverse().find(a => a.tonal && /implante/.test(a.condicao || ''));
    const freq = [250, 500, 1000, 2000, 4000, 8000];

    $('painel').innerHTML = `
      <div class="grid g-2" style="align-items:start;">
        <div class="audio-box"><p class="eyebrow">Campo livre</p><div id="audiograma"></div></div>
        <div class="card">
          <p class="eyebrow">Discriminação vocal</p>
          <div id="g-silencio"></div>
          <p class="hint">Silêncio (%). O reconhecimento da fala explica pouco da qualidade de vida — ver o separador Questionários.</p>
        </div>
      </div>
      <div class="card card-flush table-scroll" style="margin-top:20px;">
        <table><thead><tr><th>Data</th><th>Momento</th><th>Condição</th><th>Silêncio</th><th>Ruído</th><th>SRT ruído</th><th>Teste</th></tr></thead>
        <tbody>${lista.length ? [...lista].reverse().map(a => `<tr>
          <td class="mono" style="font-size:.82rem;">${fmtData(a.data)}</td><td>${esc(momento(a.momento))}</td>
          <td style="font-size:.84rem;">${esc((a.condicao || '').replace(/_/g, ' '))}</td>
          <td class="mono">${a.vocal_silencio != null ? num(a.vocal_silencio) + '%' : '—'}</td>
          <td class="mono">${a.vocal_ruido != null ? num(a.vocal_ruido) + '%' : '—'}</td>
          <td class="mono">${a.srt_ruido_db != null ? num(a.srt_ruido_db) + ' dB' : '—'}</td>
          <td style="font-size:.82rem;">${esc(a.teste || '')}</td></tr>`).join('') : `<tr><td colspan="7">${vazio('Sem avaliações registadas.')}</td></tr>`}</tbody></table>
      </div>
      <details class="bloco">
        <summary>Registar avaliação</summary>
        <form onsubmit="Ficha.novaAvaliacao(event)">
          <div class="form-grid">
            <div class="field"><label>Data</label><input type="date" name="data" value="${creicApi.hojeISO()}" required></div>
            <div class="field"><label>Momento</label><select name="momento">
              ${['basal', 'com_protese', 'ativacao', '1m', '3m', '6m', '12m', 'anual', 'upgrade_antes', 'upgrade_depois'].map(m => `<option value="${m}">${esc(momento(m))}</option>`).join('')}</select></div>
            <div class="field"><label>Condição</label><select name="condicao">
              <option value="fones">Com fones (sem prótese)</option><option value="campo_livre_protese">Campo livre com prótese</option>
              <option value="campo_livre_implante">Campo livre com implante</option></select></div>
            <div class="field"><label>Teste vocal</label><input type="text" name="teste" placeholder="ex.: monossílabos em lista aberta"></div>
            <div class="field inteiro"><label>Tonal (dB HL)</label>
              <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px;">
                ${freq.map(fq => `<div><span class="hint mono">${fq >= 1000 ? fq / 1000 + 'k' : fq}</span><input type="number" name="t${fq}" min="-10" max="130" step="5"></div>`).join('')}
              </div></div>
            <div class="field"><label>Silêncio (%)</label><input type="number" name="silencio" min="0" max="100" step="1"></div>
            <div class="field"><label>Ruído (%)</label><input type="number" name="ruido" min="0" max="100" step="1"></div>
            <div class="field"><label>SRT no ruído (dB S/R)</label><input type="number" name="srt" step="0.1"></div>
            <div class="field"><label>Notas</label><input type="text" name="notas"></div>
          </div>
          <button class="btn btn-primary" type="submit" style="margin-top:12px;">Guardar avaliação</button>
        </form>
      </details>`;

    const series = [];
    if (comProtese) series.push({ rotulo: 'Com prótese · ' + fmtData(comProtese.data), cor: '#C24A33', marca: 'x', tonal: comProtese.tonal });
    if (comImplante) series.push({ rotulo: 'Com implante · ' + fmtData(comImplante.data), cor: '#0E8C95', marca: 'o', tonal: comImplante.tonal });
    if (series.length) desenharAudiograma('audiograma', series); else $('audiograma').innerHTML = vazio('Sem audiogramas em campo livre.');

    const vs = lista.filter(a => a.vocal_silencio != null);
    desenharBarras('g-silencio', vs.map(a => Number(a.vocal_silencio)), vs.map(a => momento(a.momento)),
      { max: 100, unidade: '%', descricao: 'Discriminação vocal no silêncio por momento' });
  }

  async function novaAvaliacao(ev) {
    ev.preventDefault();
    const f = ev.target;
    const tonal = {};
    [250, 500, 1000, 2000, 4000, 8000].forEach(fq => { const v = f['t' + fq].value; if (v !== '') tonal[fq] = Number(v); });
    const n = nome => f[nome].value === '' ? null : Number(f[nome].value);
    try {
      await creicApi.registarAvaliacao({
        doente_id: F.id, data: f.data.value, momento: f.momento.value, condicao: f.condicao.value,
        tonal: Object.keys(tonal).length ? tonal : null, vocal_silencio: n('silencio'), vocal_ruido: n('ruido'),
        srt_ruido_db: n('srt'), teste: valorForm(f, 'teste'), notas: valorForm(f, 'notas')
      });
      aviso('Avaliação registada.');
      await tabAudiologia();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== DISPOSITIVO */
  async function tabDispositivo() {
    const [progs, procs, aval, resp] = await Promise.all([
      creicApi.listarProgramacoes(F.id), creicApi.listarProcessadores(F.id),
      creicApi.listarAvaliacoes(F.id), creicApi.listarRespostas(F.id)
    ]);
    const comUso = progs.filter(p => p.uso_medio_h != null).slice(-10);

    $('painel').innerHTML = `
      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Uso diário (datalogging)</p>
          <div id="g-uso"></div>
          <p class="hint">Meta de referência 10 h/dia no adulto; na criança, todas as horas acordada. Abaixo de 6 h no primeiro ano gera alerta.</p>
        </div>
        <div class="card">
          <p class="eyebrow">Processadores</p>
          ${procs.length ? procs.map(p => `<div class="linha-acao">
            <div class="corpo"><strong>${esc(p.modelo || 'Processador')}</strong> ${p.lado ? '· ' + esc(p.lado) : ''}<br>
              <span class="hint">entregue ${fmtData(p.entregue_em)} · ${mesesTexto(mesesEntre(p.entregue_em))}${p.substituido_em ? ' · substituído ' + fmtData(p.substituido_em) : ''}</span></div>
            <div class="acoes">${p.substituido_em ? '' : `<button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.substituirProcessador('${p.id}')">Marcar substituído</button>`}</div>
          </div>`).join('') : vazio('Sem processadores registados.')}
          <details class="bloco"><summary>Registar processador</summary>
            <form onsubmit="Ficha.novoProcessador(event)">
              <div class="form-grid">
                <div class="field"><label>Modelo</label><input type="text" name="modelo" required></div>
                <div class="field"><label>Lado</label><select name="lado"><option>direito</option><option>esquerdo</option></select></div>
                <div class="field"><label>Entregue em</label><input type="date" name="entregue_em" value="${creicApi.hojeISO()}" required></div>
              </div>
              <button class="btn btn-primary btn-sm" type="submit" style="margin-top:10px;">Guardar</button>
            </form></details>
        </div>
      </div>

      <div class="card" style="margin-top:20px;">
        <p class="eyebrow">Avaliação da atualização do processador</p>
        ${blocoUpgrade(aval, resp)}
      </div>

      <div class="card card-flush table-scroll" style="margin-top:20px;">
        <table><thead><tr><th>Data</th><th>Sessão</th><th>Uso</th><th>Queixas</th><th>Plano</th></tr></thead>
        <tbody>${progs.length ? [...progs].reverse().map(p => `<tr>
          <td class="mono" style="font-size:.82rem;">${fmtData(p.data)}</td>
          <td style="font-size:.84rem;">${esc(momento(p.sessao || ''))}${p.lado ? ' · ' + esc(p.lado) : ''}</td>
          <td class="mono">${p.uso_medio_h != null ? num(p.uso_medio_h) + ' h' : '—'}</td>
          <td style="font-size:.84rem;">${esc(p.queixas || '')}</td><td style="font-size:.84rem;">${esc(p.plano || '')}</td></tr>`).join('')
          : `<tr><td colspan="5">${vazio('Sem programações registadas.')}</td></tr>`}</tbody></table>
      </div>

      <details class="bloco">
        <summary>Registar programação</summary>
        <form onsubmit="Ficha.novaProgramacao(event)">
          <div class="form-grid">
            <div class="field"><label>Data</label><input type="date" name="data" value="${creicApi.hojeISO()}" required></div>
            <div class="field"><label>Sessão</label><select name="sessao">
              ${['ativacao', '1sem', '1m', '3m', '6m', '12m', 'anual', 'extra'].map(s => `<option value="${s}">${esc(s === '1sem' ? '1 semana' : momento(s))}</option>`).join('')}</select></div>
            <div class="field"><label>Lado</label><select name="lado"><option value="">—</option><option>direito</option><option>esquerdo</option><option>bilateral</option></select></div>
            <div class="field"><label>Uso médio (h/dia, datalogging)</label><input type="number" name="uso" min="0" max="24" step="0.1"></div>
            <div class="field"><label>Estratégia / mapa</label><input type="text" name="estrategia"></div>
            <div class="field"><label>Canais ativos</label><input type="number" name="canais" min="0" max="30"></div>
            <div class="field inteiro"><label>Impedâncias</label><input type="text" name="impedancias"></div>
            <div class="field"><label>Queixas</label><input type="text" name="queixas"></div>
            <div class="field"><label>Plano até à próxima</label><input type="text" name="plano"></div>
          </div>
          <button class="btn btn-primary" type="submit" style="margin-top:12px;">Guardar programação</button>
        </form>
      </details>`;

    desenharBarras('g-uso', comUso.map(p => Number(p.uso_medio_h)), comUso.map(p => fmtData(p.data).slice(0, 6)),
      { max: 14, unidade: ' h', alvo: F.doente.grupo === 'pediatrico' ? 11 : 10, alvoTxt: 'referência', descricao: 'Horas de uso diário por programação' });
  }

  /* Regra de Lailach et al. (2023): há benefício documentado se melhorar a fala
     (≥ 20 pp em monossílabos no silêncio, ou SRT no ruído ≥ 2 dB melhor) OU se
     o APHAB melhorar ≥ 3,8 pp OU o APSQ ≥ 0,74. */
  function blocoUpgrade(aval, resp) {
    const a0 = aval.find(a => a.momento === 'upgrade_antes'), a1 = aval.find(a => a.momento === 'upgrade_depois');
    const r = (q, m) => resp.find(x => x.questionario_id === q && x.momento === m);
    const ap0 = r('aphab', 'upgrade_antes'), ap1 = r('aphab', 'upgrade_depois');
    const sq0 = r('apsq', 'upgrade_antes'), sq1 = r('apsq', 'upgrade_depois');

    const criterios = [];
    if (a0 && a1 && a0.vocal_silencio != null && a1.vocal_silencio != null) {
      const d = a1.vocal_silencio - a0.vocal_silencio;
      criterios.push(['Fala no silêncio', `${num(a0.vocal_silencio)}% → ${num(a1.vocal_silencio)}% (Δ ${num(d)} pp)`, d >= 20, '≥ 20 pp']);
    }
    if (a0 && a1 && a0.srt_ruido_db != null && a1.srt_ruido_db != null) {
      const d = a0.srt_ruido_db - a1.srt_ruido_db;
      criterios.push(['Fala no ruído (SRT)', `${num(a0.srt_ruido_db)} → ${num(a1.srt_ruido_db)} dB (${num(d)} dB melhor)`, d >= 2, '≥ 2 dB']);
    }
    if (ap0 && ap1 && ap0.pontuacao != null && ap1.pontuacao != null) {
      const d = ap0.pontuacao - ap1.pontuacao;
      criterios.push(['APHAB (problema)', `${num(ap0.pontuacao)} → ${num(ap1.pontuacao)} (${num(d)} pp melhor)`, d >= 3.8, '≥ 3,8 pp']);
    }
    if (sq0 && sq1 && sq0.pontuacao != null && sq1.pontuacao != null) {
      const d = sq1.pontuacao - sq0.pontuacao;
      criterios.push(['APSQ (satisfação)', `${num(sq0.pontuacao)} → ${num(sq1.pontuacao)} (Δ ${num(d)})`, d >= 0.74, '≥ 0,74']);
    }

    const passos = `<p class="hint">Protocolo: testes vocais e APHAB + APSQ com o processador antigo (momento "Atualização — processador antigo")
      e após 4 semanas com o novo. Registe as avaliações em Audiologia e envie os questionários com esses momentos.</p>`;
    if (!criterios.length) return passos + vazio('Ainda sem medições antes e depois.');

    const algum = criterios.some(c => c[2]);
    const soPROM = algum && !criterios.filter(c => /Fala/.test(c[0])).some(c => c[2]);
    return passos + `<table><tbody>${criterios.map(c => `<tr>
        <td><strong>${c[0]}</strong></td><td class="mono" style="font-size:.84rem;">${c[1]}</td>
        <td><span class="pill ${c[2] ? 'pill-ok' : 'pill-pending'}">${c[2] ? 'relevante' : 'abaixo de ' + c[3]}</span></td></tr>`).join('')}</tbody></table>
      <div class="${algum ? 'banner-info' : 'aviso-demo'}" style="margin-top:12px;">
        <span aria-hidden="true">${algum ? '&#10003;' : '&#8505;'}</span>
        <span>${algum ? '<strong>Benefício documentado.</strong> ' + (soPROM
          ? 'Só os questionários o mostram — como em 35–42% dos doentes estudados por Lailach et al. (2023). É a documentação a juntar ao pedido.'
          : 'Pelo menos um critério audiológico ou de PROM acima do limiar.')
          : 'Nenhum critério acima do limiar com os dados registados.'}</span></div>`;
  }

  async function novaProgramacao(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.registarProgramacao({
        doente_id: F.id, data: f.data.value, sessao: f.sessao.value, lado: valorForm(f, 'lado'),
        uso_medio_h: f.uso.value === '' ? null : Number(f.uso.value), estrategia: valorForm(f, 'estrategia'),
        canais_ativos: f.canais.value === '' ? null : Number(f.canais.value), impedancias: valorForm(f, 'impedancias'),
        queixas: valorForm(f, 'queixas'), plano: valorForm(f, 'plano')
      });
      aviso('Programação registada.');
      await recarregar();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function novoProcessador(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.registarProcessador({ doente_id: F.id, modelo: f.modelo.value.trim(), lado: f.lado.value, entregue_em: f.entregue_em.value });
      aviso('Processador registado.');
      await tabDispositivo();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function substituirProcessador(id) {
    const data = prompt('Data de substituição (AAAA-MM-DD):', creicApi.hojeISO());
    if (!data) return;
    try { await creicApi.atualizarProcessador(id, { substituido_em: data }); aviso('Processador marcado como substituído.'); await recarregar(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== REABILITAÇÃO */
  async function tabReabilitacao() {
    const ped = F.doente.grupo === 'pediatrico';
    const [ex, reg, diario, marcos] = await Promise.all([
      creicApi.listarExercicios(F.id), creicApi.registosSemana(F.id), creicApi.listarDiario(F.id),
      ped ? creicApi.listarMarcos(F.id) : Promise.resolve([])
    ]);
    const feitos = id => reg.filter(r => r.exercicio_id === id).length;
    const idadeAud = F.doente.data_ativacao ? mesesEntre(F.doente.data_ativacao) : null;

    $('painel').innerHTML = `
      ${ped ? `<div class="card" style="margin-bottom:20px;">
        <p class="eyebrow">Marcos de linguagem ${idadeAud != null ? '· idade auditiva ' + mesesTexto(idadeAud) : ''}</p>
        ${marcos.length ? marcos.map(m => `<div class="linha-acao">
          <div class="corpo"><strong>${esc(m.marco)}</strong><br><span class="hint mono">esperado aos ${m.idade_auditiva_alvo_meses ?? '?'} meses de idade auditiva</span></div>
          <div class="acoes">${m.atingido_em ? `<span class="pill pill-ok">atingido ${fmtData(m.atingido_em)}</span>
              <button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.marco('${m.id}', null)">Desfazer</button>`
            : `<button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.marco('${m.id}', '${creicApi.hojeISO()}')">Atingido hoje</button>`}</div>
        </div>`).join('') : vazio('Sem marcos registados.')}
        <details class="bloco"><summary>Acrescentar marco</summary>
          <form onsubmit="Ficha.novoMarco(event)"><div class="form-grid">
            <div class="field"><label>Marco</label><input type="text" name="marco" required placeholder="ex.: Junta duas palavras"></div>
            <div class="field"><label>Idade auditiva esperada (meses)</label><input type="number" name="idade" min="0" max="120"></div>
          </div><button class="btn btn-primary btn-sm" type="submit" style="margin-top:10px;">Guardar</button></form></details>
      </div>` : ''}

      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Treino em casa · últimos 7 dias</p>
          ${ex.length ? ex.map(e => {
            const n = feitos(e.id), pct = Math.min(100, Math.round(n / e.alvo_semanal * 100));
            return `<div class="linha-acao">
              <div class="corpo"><strong style="${e.ativo ? '' : 'color:var(--ink-soft); text-decoration:line-through;'}">${esc(e.titulo)}</strong>
                <span class="hint"> · ${esc(e.frequencia || '')}</span>
                <div class="bar ${pct >= 100 ? '' : (pct >= 60 ? 'b-warn' : 'b-alert')}" style="max-width:none; margin-top:6px;"><span style="width:${pct}%"></span></div>
                <span class="hint mono">${n} de ${e.alvo_semanal}</span></div>
              <div class="acoes"><button class="btn btn-ghost btn-sm" type="button" onclick="Ficha.alternarExercicio('${e.id}', ${!e.ativo})">${e.ativo ? 'Suspender' : 'Reativar'}</button></div>
            </div>`;
          }).join('') : vazio('Sem exercícios prescritos.')}
          <details class="bloco"><summary>Prescrever exercício</summary>
            <form onsubmit="Ficha.novoExercicio(event)"><div class="form-grid">
              <div class="field inteiro"><label>Exercício</label><input type="text" name="titulo" required></div>
              <div class="field"><label>Frequência</label><input type="text" name="frequencia" placeholder="ex.: 2x/dia, 5 min"></div>
              <div class="field"><label>Vezes por semana</label><input type="number" name="alvo" min="1" max="21" value="7"></div>
              <div class="field inteiro"><label>Instruções para casa</label><input type="text" name="instrucoes"></div>
            </div><button class="btn btn-primary btn-sm" type="submit" style="margin-top:10px;">Prescrever</button></form></details>
        </div>
        <div class="card">
          <p class="eyebrow">Diário escrito pelo utilizador</p>
          ${diario.length ? diario.map(d => `<div class="linha-acao"><div class="corpo">
            <span class="hint mono">${fmtData(d.criado_em)}${d.como_correu ? ' · semana ' + d.como_correu + '/5' : ''}${d.tirou_processador ? ' · tirou o processador: ' + esc(d.tirou_processador) : ''}</span>
            <p style="font-size:.88rem; margin:4px 0 0;">${esc(d.texto || '')}</p></div></div>`).join('') : vazio('Sem registos no diário.')}
        </div>
      </div>`;
  }

  async function novoExercicio(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.criarExercicio({ doente_id: F.id, titulo: f.titulo.value.trim(), frequencia: valorForm(f, 'frequencia'),
        alvo_semanal: Number(f.alvo.value) || 7, instrucoes: valorForm(f, 'instrucoes') });
      aviso('Exercício prescrito.');
      await tabReabilitacao();
    } catch (e) { aviso(e.message, 'erro'); }
  }
  async function alternarExercicio(id, ativo) {
    try { await creicApi.atualizarExercicio(id, { ativo }); await tabReabilitacao(); } catch (e) { aviso(e.message, 'erro'); }
  }
  async function novoMarco(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.criarMarco({ doente_id: F.id, marco: f.marco.value.trim(), idade_auditiva_alvo_meses: f.idade.value === '' ? null : Number(f.idade.value) });
      await tabReabilitacao();
    } catch (e) { aviso(e.message, 'erro'); }
  }
  async function marco(id, data) {
    try { await creicApi.marcarMarco(id, data); await tabReabilitacao(); } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== RESULTADOS SOCIAIS */
  async function tabSociais() {
    const lista = await creicApi.listarResultadosSociais(F.id);
    const ped = F.doente.grupo === 'pediatrico';
    $('painel').innerHTML = `
      <div class="banner-sign" style="margin-bottom:18px; max-width:80ch;">
        <span aria-hidden="true">&#128202;</span>
        <span>${ped
          ? 'Na análise custo-benefício de Neve et al. (2021), a escolaridade foi o maior benefício social do implante pediátrico. Registe o tipo de escolaridade no início de cada ano letivo.'
          : 'Na idade ativa, o benefício social do implante vem sobretudo da manutenção do emprego (Neve et al., 2021). Registe a situação profissional na candidatura e em cada avaliação anual.'}</span>
      </div>
      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Registos</p>
          ${lista.length ? lista.map(r => `<div class="linha-acao"><div class="corpo">
            <span class="hint mono">${fmtData(r.data)}</span><br>
            ${r.situacao_profissional ? '<strong>' + esc(SOCIAL.situacao_profissional[r.situacao_profissional]) + '</strong>' : ''}
            ${r.escolaridade ? '<strong>' + esc(SOCIAL.escolaridade[r.escolaridade]) + '</strong>' : ''}
            ${r.notas ? '<p class="hint" style="margin:2px 0 0;">' + esc(r.notas) + '</p>' : ''}</div></div>`).join('') : vazio('Sem registos.')}
        </div>
        <div class="card">
          <p class="eyebrow">Novo registo</p>
          <form onsubmit="Ficha.novoSocial(event)">
            <div class="field"><label>Data</label><input type="date" name="data" value="${creicApi.hojeISO()}" required></div>
            <div class="field"><label>Situação profissional</label><select name="situacao"><option value="">—</option>
              ${Object.entries(SOCIAL.situacao_profissional).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
            <div class="field"><label>Escolaridade</label><select name="escolaridade"><option value="">—</option>
              ${Object.entries(SOCIAL.escolaridade).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
            <div class="field"><label>Notas</label><input type="text" name="notas" placeholder="${ped ? 'ex.: microfone remoto em uso; professor de educação especial' : 'ex.: regressou ao trabalho a tempo inteiro'}"></div>
            <button class="btn btn-primary" type="submit">Guardar</button>
          </form>
        </div>
      </div>`;
  }
  async function novoSocial(ev) {
    ev.preventDefault();
    const f = ev.target;
    if (!f.situacao.value && !f.escolaridade.value) { aviso('Escolha a situação profissional ou a escolaridade.', 'erro'); return; }
    try {
      await creicApi.registarResultadoSocial({ doente_id: F.id, data: f.data.value, situacao_profissional: f.situacao.value || null,
        escolaridade: f.escolaridade.value || null, notas: valorForm(f, 'notas') });
      aviso('Registo guardado.');
      await tabSociais();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== DECISÕES */
  async function tabDecisoes() {
    const lista = await creicApi.listarDecisoes(F.id);
    $('painel').innerHTML = `
      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Decisões da reunião multidisciplinar</p>
          ${lista.length ? lista.map(d => `<div class="linha-acao"><div class="corpo">
            <span class="hint mono">${fmtData(d.data_reuniao)}</span><br>
            <strong>${esc(DECISAO[d.decisao])}</strong>${d.lado_proposto ? ' · ' + esc(d.lado_proposto) : ''}
            ${d.fundamentacao ? '<p style="font-size:.86rem; margin:4px 0 0;">' + esc(d.fundamentacao) + '</p>' : ''}
            ${d.pendentes ? '<p class="hint" style="margin:2px 0 0;"><strong>Pendente:</strong> ' + esc(d.pendentes) + '</p>' : ''}</div></div>`).join('') : vazio('Sem decisões registadas.')}
        </div>
        <div class="card">
          <p class="eyebrow">Registar decisão</p>
          <form onsubmit="Ficha.novaDecisao(event)">
            <div class="form-grid">
              <div class="field"><label>Data da reunião</label><input type="date" name="data" value="${creicApi.hojeISO()}" required></div>
              <div class="field"><label>Decisão</label><select name="decisao">${Object.entries(DECISAO).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
              <div class="field"><label>Lado proposto</label><select name="lado"><option value="">—</option><option>direito</option><option>esquerdo</option><option>bilateral</option></select></div>
              <div class="field inteiro"><label>Fundamentação</label><textarea name="fundamentacao" rows="3"></textarea></div>
              <div class="field inteiro"><label>Pendente</label><input type="text" name="pendentes"></div>
            </div>
            <button class="btn btn-primary" type="submit" style="margin-top:12px;">Registar</button>
          </form>
        </div>
      </div>`;
  }
  async function novaDecisao(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.registarDecisao({ doente_id: F.id, data_reuniao: f.data.value, decisao: f.decisao.value, lado_proposto: f.lado.value || null,
        fundamentacao: valorForm(f, 'fundamentacao'), pendentes: valorForm(f, 'pendentes') });
      aviso('Decisão registada. Atualize a etapa correspondente no Percurso.');
      await tabDecisoes();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== MENSAGENS */
  async function tabMensagens() {
    const lista = await creicApi.listarMensagens(F.id);
    $('painel').innerHTML = `
      <div class="card" style="max-width:820px;">
        <div id="conversa">${lista.length ? lista.map(m => `
          <div class="msg ${m.papel_autor === 'profissional' ? 'eu' : ''}">
            <span class="av" aria-hidden="true">${esc((m.autor_nome || '?').split(' ').filter(p => p.length > 2).slice(0, 2).map(p => p[0]).join('').toUpperCase())}</span>
            <div class="bolha">
              <p class="quem">${esc(m.autor_nome)} · ${fmtDataHora(m.criado_em)} ${m.urgente ? '<span class="pill pill-alert">urgente</span>' : ''}</p>
              <p>${esc(m.texto)}</p>
            </div>
          </div>`).join('') : vazio('Ainda sem mensagens.')}</div>
        <hr class="divider">
        <form onsubmit="Ficha.enviarMensagem(event)">
          <div class="field"><label for="texto-msg">Responder</label><textarea id="texto-msg" name="texto" rows="3" required></textarea></div>
          <button class="btn btn-primary" type="submit">Enviar</button>
          <span class="hint" style="margin-left:10px;">Assina como ${esc(F.sessao.nome)}.</span>
        </form>
      </div>`;
    if (lista.some(m => m.papel_autor === 'utilizador' && !m.lida_equipa_em)) {
      await creicApi.marcarMensagensLidas(F.id);
      F.estado.mensagens_por_ler = 0;
      pintarTabs();
      document.querySelector('#tabs [data-tab="mensagens"]').classList.add('active');
    }
  }
  async function enviarMensagem(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.enviarMensagem(F.id, f.texto.value, { papel: 'profissional', nome: F.sessao.nome });
      await tabMensagens();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  /* ===================================================================== DADOS E GRUPO */
  async function tabDados() {
    const d = F.doente;
    const campo = (nome, rotulo, tipo, extra) => `<div class="field ${extra || ''}"><label>${rotulo}</label><input type="${tipo || 'text'}" name="${nome}" value="${esc(d[nome] || '')}"></div>`;
    $('painel').innerHTML = `
      <div class="grid g-2" style="align-items:start;">
        <div class="card">
          <p class="eyebrow">Dados do doente</p>
          <form onsubmit="Ficha.guardarDados(event)">
            <div class="form-grid">
              ${campo('nome', 'Nome', 'text', 'inteiro')}
              ${campo('processo', 'N.º de processo')}
              ${campo('data_nascimento', 'Data de nascimento', 'date')}
              ${campo('etiologia', 'Diagnóstico / etiologia', 'text', 'inteiro')}
              ${campo('data_referenciacao', 'Referenciação', 'date')}
              ${campo('data_ativacao', 'Ativação (conta a idade auditiva)', 'date')}
              <div class="field"><label>Implante</label><select name="lado_implante">${['nenhum', 'direito', 'esquerdo', 'bilateral'].map(v => `<option ${d.lado_implante === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
              <div class="field"><label>Estado</label><select name="estado">${['ativo', 'alta', 'abandono', 'transferido'].map(v => `<option ${d.estado === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
              ${campo('gestor_caso', 'Gestor(a) de caso')}
              ${campo('responsaveis', 'Responsabilidades parentais')}
              <div class="field inteiro"><label>Notas</label><textarea name="notas" rows="2">${esc(d.notas || '')}</textarea></div>
            </div>
            <button class="btn btn-primary" type="submit" style="margin-top:12px;">Guardar dados</button>
          </form>
        </div>
        <div class="card" style="border-color:var(--warn);">
          <p class="eyebrow" style="color:var(--warn);">Grupo da jornada</p>
          <h3 style="font-size:1.1rem;">Atualmente: ${ROTULOS.grupo[d.grupo]}</h3>
          <p style="font-size:.9rem; color:var(--ink-soft);">
            Mudar de grupo acrescenta as etapas da outra jornada e passa a mostrar ao utilizador a outra área.
            O que já foi registado não se perde: as etapas antigas ficam no histórico.
          </p>
          ${d.grupo === 'pediatrico' ? `<p style="font-size:.9rem; color:var(--ink-soft);">
            <strong>Na transição aos 18 anos:</strong> antes de mudar, confirme a etapa "Transição para a área de adulto" e crie o acesso do próprio.
            Depois, retire em "Contas e acesso" as contas dos pais que já não devam ver os dados — salvo decisão do jovem.</p>` : ''}
          <button class="btn btn-ghost" type="button" onclick="Ficha.mudarGrupo()">Passar para ${d.grupo === 'pediatrico' ? 'adulto' : 'pediátrico'}</button>
        </div>
      </div>`;
  }
  async function guardarDados(ev) {
    ev.preventDefault();
    const f = ev.target;
    const campos = {};
    ['nome', 'processo', 'data_nascimento', 'etiologia', 'data_referenciacao', 'data_ativacao', 'lado_implante', 'estado', 'gestor_caso', 'responsaveis', 'notas']
      .forEach(n => { campos[n] = valorForm(f, n); });
    if (!campos.nome || !campos.processo) { aviso('Nome e processo são obrigatórios.', 'erro'); return; }
    campos.lado_implante = campos.lado_implante || 'nenhum';
    campos.estado = campos.estado || 'ativo';
    try { await creicApi.atualizarDoente(F.id, campos); aviso('Dados guardados.'); await recarregar(); }
    catch (e) { aviso(e.message, 'erro'); }
  }
  async function mudarGrupo() {
    const novo = F.doente.grupo === 'pediatrico' ? 'adulto' : 'pediatrico';
    if (!confirm('Passar ' + F.doente.nome + ' para o grupo ' + ROTULOS.grupo[novo].toLowerCase() + '? O utilizador passa a ver a outra área na próxima vez que entrar.')) return;
    try { await creicApi.atualizarDoente(F.id, { grupo: novo }); aviso('Grupo alterado.'); location.hash = 'percurso'; await recarregar(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  async function guardarPreferencias(ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.guardarPreferencias(F.id, {
        canais: marcados(f, 'canais'), canais_proibidos: f.proibir.checked ? ['chamada_telefonica'] : [],
        usa_lgp: f.usa_lgp.checked, precisa_interprete: f.precisa_interprete.checked,
        leitura_labial: f.leitura_labial.checked, linguagem_simples: f.linguagem_simples.checked, notas: valorForm(f, 'notas')
      });
      aviso('Preferências guardadas.');
      await carregarBase();
    } catch (e) { aviso(e.message, 'erro'); }
  }

  async function tratarAlerta(chave) {
    const nota = prompt('Nota sobre o que foi feito (opcional):');
    if (nota === null) return;
    try { await creicApi.tratarAlerta(chave, F.id, nota); aviso('Alerta tratado.'); await carregarBase(); }
    catch (e) { aviso(e.message, 'erro'); }
  }

  window.Ficha = {
    abrir, guardarEtapa, criarConvite, removerConta, novaMarcacao, marcarPedido, estadoMarcacao, apoioGarantido,
    escolheuQuestionario, enviarPedido, registarPontuacao, cancelarPedido, novaAvaliacao, novaProgramacao,
    novoProcessador, substituirProcessador, novoExercicio, alternarExercicio, novoMarco, marco, novoSocial,
    novaDecisao, enviarMensagem, guardarDados, mudarGrupo, guardarPreferencias, tratarAlerta
  };

  iniciar();
})();
