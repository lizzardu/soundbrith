/* ========================================================================
   SOUNDBIRTH — blocos partilhados pelas áreas de utilizador
   (area-adulto e area-pediatrica). Cada página chama U.iniciar() e depois
   os blocos de que precisa. O texto que muda entre as duas áreas entra por
   parâmetro; a mecânica é a mesma.
   ======================================================================== */

(function () {
  const U = {};
  let S = null;   // sessão: { nome, papel, doente_id, doente_nome, grupo, relacao }

  U.iniciar = async function () {
    S = await iniciarPagina();
    return S;
  };
  U.sessao = () => S;
  U.primeiroNome = () => (S && S.doente_nome ? S.doente_nome.split(' ')[0] : '');

  /* ---------------------------------------------------------------- JORNADA */
  U.jornada = async function (idOnda, idLista, opcoes) {
    const fases = await creicApi.obterJornada(S.doente_id, S.grupo);
    if (idOnda) desenharOnda(idOnda, fases);
    if (idLista) document.getElementById(idLista).innerHTML = htmlJornada(fases, Object.assign({ simples: false }, opcoes));
    return fases;
  };

  U.etapaAtual = function (fases) {
    const todas = fases.flatMap(f => f.etapas);
    const ativa = todas.find(e => e.registo && e.registo.estado === 'ativo');
    return { ativa, feitas: todas.filter(e => e.registo && e.registo.estado === 'feito').length, total: todas.length };
  };

  /* ---------------------------------------------------------------- MARCAÇÕES */
  U.marcacoes = async function (idEl, textos) {
    const t = Object.assign({ remarcar: 'Preciso de remarcar' }, textos || {});
    const el = document.getElementById(idEl);
    const [lista, prefs] = await Promise.all([creicApi.listarMarcacoes(S.doente_id), creicApi.obterPreferencias(S.doente_id)]);
    const agora = new Date();
    const futuras = lista.filter(m => m.quando && new Date(m.quando) >= agora && ['marcada', 'confirmada'].includes(m.estado));
    const pedidos = lista.filter(m => m.estado === 'pedido');
    const passadas = lista.filter(m => m.quando && new Date(m.quando) < agora).reverse().slice(0, 8);
    const lgp = prefs && (prefs.usa_lgp || prefs.precisa_interprete);

    el.innerHTML = `
      ${futuras.length ? futuras.map(m => `
        <div class="card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;">
            <div>
              <p class="mono" style="color:var(--wave-deep); font-size:.88rem; margin-bottom:4px;">${fmtDataHora(m.quando)}</p>
              <h2 style="font-size:1.1rem; margin-bottom:6px;">${esc(m.tipo)}</h2>
              <p style="font-size:.88rem; color:var(--ink-soft); margin:0;">${esc([m.local, m.profissional].filter(Boolean).join(' · '))}</p>
            </div>
            <div style="text-align:right;">
              <span class="pill ${m.estado === 'confirmada' ? 'pill-ok' : 'pill-pending'}">${esc(m.estado)}</span>
              ${(m.apoio_pedido || []).length ? `<br><span class="pill ${m.apoio_garantido ? 'pill-ok' : 'pill-warn'}" style="margin-top:6px;">
                ${m.apoio_garantido ? 'apoio garantido' : 'apoio pedido'}</span>` : ''}
            </div>
          </div>
          <details class="bloco">
            <summary>Pedir apoio para esta consulta</summary>
            <form onsubmit="U.pedirApoio(event, '${m.id}')">
              <div class="chip-group">${Object.entries(ROTULOS.apoio).map(([v, txt]) =>
                `<label class="chip"><input type="checkbox" name="apoio" value="${v}" ${(m.apoio_pedido || []).includes(v) || (!m.apoio_pedido.length && lgp && v === 'interprete_lgp') ? 'checked' : ''}><span>${txt}</span></label>`).join('')}</div>
              <p class="hint" style="margin:8px 0;">Peça com pelo menos 5 dias úteis. O pedido fica visível para a equipa na marcação.</p>
              <button class="btn btn-wave btn-sm" type="submit">Enviar pedido</button>
            </form>
          </details>
        </div>`).join('') : `<div class="card" style="margin-bottom:14px;">${vazio('Não tem consultas marcadas.')}</div>`}

      ${pedidos.length ? `<div class="card" style="margin-bottom:14px; border-style:dashed;">
        <p class="eyebrow">Pedidos à espera de resposta</p>
        ${pedidos.map(m => `<div class="linha-acao"><div class="corpo"><span class="hint mono">${fmtData(m.criado_em)}</span>
          <p style="font-size:.9rem; margin:2px 0 0;">${esc(m.motivo || '')}</p></div></div>`).join('')}
      </div>` : ''}

      <div class="card" style="border-style:dashed;">
        <p class="eyebrow">Pedir uma consulta</p>
        <p style="font-size:.9rem; color:var(--ink-soft);">Sem telefonar: escreva o motivo e a equipa marca e avisa por escrito.</p>
        <form onsubmit="U.pedirConsulta(event)">
          <div class="field"><label for="motivo">Motivo</label>
            <textarea id="motivo" name="motivo" rows="3" required placeholder="${esc(t.exemploMotivo || 'ex.: o som mudou nas últimas semanas e gostava de uma programação')}"></textarea></div>
          <button class="btn btn-wave" type="submit">Enviar pedido</button>
        </form>
      </div>

      ${passadas.length ? `<div class="card" style="margin-top:14px;">
        <p class="eyebrow">Consultas anteriores</p>
        ${passadas.map(m => `<div class="linha-acao"><div class="corpo"><strong style="font-size:.9rem;">${esc(m.tipo)}</strong><br>
          <span class="hint mono">${fmtData(m.quando)} · ${esc(m.estado)}</span></div></div>`).join('')}
      </div>` : ''}`;
  };

  U.pedirApoio = async function (ev, id) {
    ev.preventDefault();
    try { await creicApi.pedirApoio(id, marcados(ev.target, 'apoio')); aviso('Pedido de apoio enviado à equipa.'); location.reload(); }
    catch (e) { aviso(e.message, 'erro'); }
  };

  U.pedirConsulta = async function (ev) {
    ev.preventDefault();
    try { await creicApi.pedirConsulta(S.doente_id, ev.target.motivo.value.trim()); aviso('Pedido enviado. A equipa responde por escrito.'); location.reload(); }
    catch (e) { aviso(e.message, 'erro'); }
  };

  /* ---------------------------------------------------------------- MENSAGENS */
  U.mensagens = async function (idEl) {
    const el = document.getElementById(idEl);
    const lista = await creicApi.listarMensagens(S.doente_id);
    el.innerHTML = `
      <div id="conversa">${lista.length ? lista.map(m => {
        const meu = m.papel_autor === 'utilizador';
        const ini = (m.autor_nome || '?').split(' ').filter(p => p.length > 2).slice(0, 2).map(p => p[0]).join('').toUpperCase();
        return `<div class="msg ${meu ? 'eu' : ''}">
          <span class="av" aria-hidden="true">${meu ? 'EU' : esc(ini)}</span>
          <div class="bolha"><p class="quem">${esc(m.autor_nome)} · ${fmtDataHora(m.criado_em)} ${m.urgente ? '<span class="pill pill-alert">urgente</span>' : ''}</p>
            <p>${esc(m.texto)}</p></div>
        </div>`;
      }).join('') : vazio('Ainda não há mensagens. Pode escrever à equipa quando precisar.')}</div>
      <hr class="divider">
      <form onsubmit="U.enviarMensagem(event)">
        <div class="field"><label for="nova">A sua mensagem</label><textarea id="nova" name="texto" rows="3" required></textarea></div>
        <label style="display:flex; gap:8px; align-items:center; font-weight:500; margin-bottom:14px;">
          <input type="checkbox" name="urgente"> É urgente — aparece em destaque à equipa, no horário do centro
        </label>
        <p class="hint" style="margin:-6px 0 14px;">Não substitui a urgência: numa emergência médica, dirija-se ao serviço de urgência ou ligue 112.</p>
        <button class="btn btn-wave" type="submit">Enviar</button>
      </form>`;
    const c = document.getElementById('conversa');
    c.lastElementChild && c.lastElementChild.scrollIntoView({ block: 'nearest' });
    if (lista.some(m => m.papel_autor === 'profissional' && !m.lida_utilizador_em)) creicApi.marcarMensagensLidas(S.doente_id).catch(() => {});
  };

  U.enviarMensagem = async function (ev) {
    ev.preventDefault();
    const f = ev.target;
    try {
      await creicApi.enviarMensagem(S.doente_id, f.texto.value, { papel: 'utilizador', nome: S.nome, urgente: f.urgente.checked });
      await U.mensagens('mensagens');
    } catch (e) { aviso(e.message, 'erro'); }
  };

  U.preferencias = async function (idEl) {
    const el = document.getElementById(idEl);
    const p = (await creicApi.obterPreferencias(S.doente_id)) || { canais: [], canais_proibidos: [] };
    const canais = { plataforma: 'Mensagem nesta plataforma', sms: 'SMS', email: 'Email', video_legendado: 'Videochamada com legendas', video_lgp: 'Videochamada em LGP' };
    const proibido = (p.canais_proibidos || []).includes('chamada_telefonica');
    el.innerHTML = `
      <form onsubmit="U.guardarPreferencias(event)">
        <div class="field"><label>Prefiro que a equipa fale comigo por</label>
          <div class="chip-group">${Object.entries(canais).map(([v, t]) =>
            `<label class="chip"><input type="checkbox" name="canais" value="${v}" ${(p.canais || []).includes(v) ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div></div>
        <div class="field"><div class="chip-group">
          <label class="chip"><input type="checkbox" name="proibir" ${proibido ? 'checked' : ''}><span>Nunca me telefonem</span></label>
          <label class="chip"><input type="checkbox" name="usa_lgp" ${p.usa_lgp ? 'checked' : ''}><span>Uso Língua Gestual Portuguesa</span></label>
          <label class="chip"><input type="checkbox" name="precisa_interprete" ${p.precisa_interprete ? 'checked' : ''}><span>Preciso de intérprete nas consultas</span></label>
          <label class="chip"><input type="checkbox" name="linguagem_simples" ${p.linguagem_simples ? 'checked' : ''}><span>Prefiro linguagem simples</span></label>
        </div></div>
        ${proibido ? `<div class="banner-sign" style="margin-bottom:14px;"><span aria-hidden="true">&#9995;</span>
          <span>A chamada telefónica está <strong>desativada</strong> no seu perfil. A equipa vê isto antes de qualquer contacto.</span></div>` : ''}
        <button class="btn btn-ghost" type="submit">Guardar preferências</button>
      </form>`;
  };

  U.guardarPreferencias = async function (ev) {
    ev.preventDefault();
    const f = ev.target;
    const atual = (await creicApi.obterPreferencias(S.doente_id)) || {};
    try {
      await creicApi.guardarPreferencias(S.doente_id, {
        canais: marcados(f, 'canais'), canais_proibidos: f.proibir.checked ? ['chamada_telefonica'] : [],
        usa_lgp: f.usa_lgp.checked, precisa_interprete: f.precisa_interprete.checked,
        linguagem_simples: f.linguagem_simples.checked, leitura_labial: !!atual.leitura_labial, notas: atual.notas || null
      });
      aviso('Preferências guardadas.');
      await U.preferencias('preferencias');
    } catch (e) { aviso(e.message, 'erro'); }
  };

  /* ---------------------------------------------------------------- QUESTIONÁRIOS */
  const QUEM = {
    proprio: 'Responde a própria pessoa.',
    cuidador: 'Respondem os pais ou quem cuida da criança, sobre o que observam.',
    crianca_apoio: 'Responde a criança, com ajuda de um adulto só para ler as perguntas — as respostas são dela.',
    professor: 'Responde a educadora ou o professor. A equipa combina convosco como lhe fazer chegar o questionário.'
  };

  U.questionarios = async function (idPendentes, idFeitos) {
    const pedidos = await creicApi.listarPedidos(S.doente_id);
    const pend = pedidos.filter(p => p.estado === 'pendente');
    const feitos = pedidos.filter(p => p.estado === 'respondido');
    U._pedidos = pedidos;

    document.getElementById(idPendentes).innerHTML = pend.length ? pend.map(p => `
      <div class="card" style="margin-bottom:14px;" id="q-${p.id}">
        <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start;">
          <div>
            <p class="eyebrow">${p.questionarios.minutos ? '~' + p.questionarios.minutos + ' minutos' : 'Questionário'}${p.prazo ? ' · até ' + fmtData(p.prazo) : ''}</p>
            <h3 style="font-size:1.05rem; margin-bottom:4px;">${esc(p.questionarios.sigla)} <span class="hint" style="font-family:var(--f-body);">${esc(p.questionarios.nome)}</span></h3>
            <p class="hint" style="margin:0;">${esc(QUEM[p.respondente] || '')}</p>
          </div>
          ${p.questionarios.definicao ? `<button class="btn btn-wave btn-sm" type="button" onclick="U.abrirQuestionario('${p.id}')">Responder</button>`
            : '<span class="pill pill-pending">preenchido na consulta</span>'}
        </div>
        <div id="form-${p.id}"></div>
      </div>`).join('') : `<div class="card">${vazio('Não tem questionários por responder.')}</div>`;

    if (idFeitos) document.getElementById(idFeitos).innerHTML = feitos.length ? feitos.map(p => `
      <div class="linha-acao"><div class="corpo"><strong style="font-size:.9rem;">${esc(p.questionarios.sigla)}</strong>
        <span class="hint"> · ${esc(p.questionarios.nome)}</span><br><span class="hint mono">respondido ${fmtData(p.respondido_em)}</span></div>
        <div class="acoes"><span class="pill pill-ok">obrigado</span></div></div>`).join('') : vazio('Ainda sem questionários respondidos.');
  };

  U.abrirQuestionario = function (pedidoId) {
    const p = U._pedidos.find(x => x.id === pedidoId);
    const def = p.questionarios.definicao;
    const alvo = document.getElementById('form-' + pedidoId);
    if (alvo.innerHTML) { alvo.innerHTML = ''; return; }

    const opcoes = (it, escala) => {
      const nome = 'i_' + it.id;
      const valores = [];
      for (let v = escala.min; v <= escala.max; v++) valores.push(v);
      const rotulo = v => escala.extremos ? String(v) : (escala.rotulos[v - escala.min] || v);
      return `<div class="opcoes-q" role="radiogroup" aria-label="${esc(it.texto)}">
        ${valores.map(v => `<label><input type="radio" name="${nome}" value="${v}" required><span>${esc(rotulo(v))}</span></label>`).join('')}
      </div>${escala.extremos ? `<div class="extremos-q"><span>${esc(escala.rotulos[0])}</span><span>${esc(escala.rotulos[1])}</span></div>` : ''}`;
    };

    let corpo;
    if (def.metodo === 'murqol') {
      corpo = ['frequencia', 'importancia'].map(sec => `
        <h4 style="margin:18px 0 4px; color:var(--wave-deep);">${esc((def.rotulos_seccoes || {})[sec] || sec)}</h4>
        ${def.itens.filter(i => i.seccao === sec).map((it, n) => `<div class="item-q"><p>${n + 1}. ${esc(it.texto)}</p>${opcoes(it, def.escalas[sec])}</div>`).join('')}`).join('');
    } else {
      corpo = def.itens.map((it, n) => `<div class="item-q"><p>${n + 1}. ${esc(it.texto)}</p>${opcoes(it, def.escala)}</div>`).join('');
    }

    alvo.innerHTML = `
      <form onsubmit="U.submeterQuestionario(event, '${pedidoId}')" style="margin-top:14px;">
        ${def.demonstracao ? `<div class="aviso-demo"><span aria-hidden="true">&#9888;</span>
          <span>Versão de demonstração: as perguntas oficiais deste questionário estão protegidas por direitos de autor e vão ser carregadas a partir da versão portuguesa licenciada.</span></div>` : ''}
        ${def.introducao ? `<p style="font-size:.92rem;">${esc(def.introducao)}</p>` : ''}
        ${corpo}
        <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
          <button class="btn btn-wave" type="submit">Enviar respostas</button>
          <button class="btn btn-ghost" type="button" onclick="document.getElementById('form-${pedidoId}').innerHTML=''">Fechar</button>
        </div>
      </form>`;
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  U.submeterQuestionario = async function (ev, pedidoId) {
    ev.preventDefault();
    const p = U._pedidos.find(x => x.id === pedidoId);
    const def = p.questionarios.definicao;
    const f = ev.target;
    const respostas = {};
    def.itens.forEach(it => { const sel = f.querySelector(`input[name="i_${it.id}"]:checked`); if (sel) respostas[it.id] = Number(sel.value); });
    const { pontuacao, subescalas } = creicApi.pontuar(def, respostas);
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'A enviar…';
    try {
      await creicApi.responder(pedidoId, respostas, pontuacao, subescalas);
      document.getElementById('q-' + pedidoId).innerHTML = `<p class="eyebrow">Respondido</p>
        <h3 style="font-size:1.05rem;">Obrigado.</h3>
        <p style="font-size:.9rem; color:var(--ink-soft); margin:0;">As respostas ficaram no processo e a equipa vê-as antes da próxima consulta.</p>`;
    } catch (e) {
      aviso(e.message, 'erro');
      btn.disabled = false; btn.textContent = 'Enviar respostas';
    }
  };

  /* ---------------------------------------------------------------- TREINO EM CASA */
  U.treino = async function (idEl, textos) {
    const t = Object.assign({ fiz: 'Fiz hoje', feito: 'Registado hoje' }, textos || {});
    const el = document.getElementById(idEl);
    const [ex, reg] = await Promise.all([creicApi.listarExercicios(S.doente_id, true), creicApi.registosSemana(S.doente_id)]);
    const hoje = creicApi.hojeISO();
    el.innerHTML = ex.length ? ex.map(e => {
      const n = reg.filter(r => r.exercicio_id === e.id).length;
      const pct = Math.min(100, Math.round(n / e.alvo_semanal * 100));
      const jaHoje = reg.some(r => r.exercicio_id === e.id && r.data === hoje);
      return `<div class="card" style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-start;">
          <div style="flex:1; min-width:240px;">
            <h2 style="font-size:1.05rem; margin-bottom:4px;">${esc(e.titulo)}</h2>
            <p style="font-size:.86rem; color:var(--ink-soft); margin-bottom:8px;">${esc([e.frequencia, e.instrucoes].filter(Boolean).join(' · '))}</p>
            <div class="bar ${pct >= 100 ? '' : (pct >= 60 ? 'b-warn' : 'b-alert')}"><span style="width:${pct}%"></span></div>
            <p class="hint mono" style="margin:6px 0 0;">${n} de ${e.alvo_semanal} nos últimos 7 dias</p>
          </div>
          <button class="btn ${jaHoje ? 'btn-ghost' : 'btn-wave'} btn-sm" type="button" ${jaHoje ? 'disabled' : ''}
                  onclick="U.registarExercicio('${e.id}', this)">${jaHoje ? t.feito + ' &#10003;' : t.fiz}</button>
        </div>
      </div>`;
    }).join('') : `<div class="card">${vazio('A equipa ainda não prescreveu exercícios.')}</div>`;
  };

  U.registarExercicio = async function (id, btn) {
    btn.disabled = true;
    try { await creicApi.registarExercicioHoje(id, S.doente_id); await U.treino('exercicios'); }
    catch (e) { aviso(e.message, 'erro'); btn.disabled = false; }
  };

  U.gravarDiario = async function (ev) {
    ev.preventDefault();
    const f = ev.target;
    const campos = { texto: valorForm(f, 'texto') };
    const sem = f.querySelector('input[name=semana]:checked'); if (sem) campos.como_correu = Number(sem.value);
    const tirou = f.querySelector('input[name=tirou]:checked'); if (tirou) campos.tirou_processador = tirou.value;
    if (!campos.texto && !campos.como_correu && !campos.tirou_processador) { aviso('Escreva alguma coisa antes de guardar.', 'erro'); return; }
    try { await creicApi.escreverDiario(S.doente_id, campos); f.reset(); aviso('Guardado. A equipa lê antes da próxima sessão.'); }
    catch (e) { aviso(e.message, 'erro'); }
  };

  window.U = U;
})();
