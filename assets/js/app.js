/* ========================================================================
   SOUNDBIRTH — comportamento comum
   - guarda de acesso: cada página declara a sua área e é redirecionada se a
     sessão não lhe corresponder (papel errado, ou grupo errado)
   - cabeçalho e menu por área
   - utilitários de formatação (com escape de HTML para tudo o que vem da BD)
   - gráficos em SVG, sem bibliotecas externas
   ======================================================================== */

/* ---------- utilitários ---------- */
function esc(v) {
  return v == null ? '' : String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function num(v, casas) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  return (casas == null ? String(Math.round(n * 10) / 10) : n.toFixed(casas)).replace('.', ',');
}
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function fmtData(iso) {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return String(d.getDate()).padStart(2, '0') + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
}
function fmtDataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return fmtData(iso) + ', ' + String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
}
function mesesEntre(isoInicio, fim) {
  if (!isoInicio) return null;
  const a = new Date(isoInicio + 'T12:00:00'), b = fim ? new Date(fim) : new Date();
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m--;
  return Math.max(0, m);
}
function idadeTexto(isoNasc) {
  const m = mesesEntre(isoNasc);
  if (m == null) return '—';
  if (m < 24) return m + (m === 1 ? ' mês' : ' meses');
  const a = Math.floor(m / 12);
  return a + ' anos';
}
function mesesTexto(m) {
  if (m == null) return '—';
  const a = Math.floor(m / 12), r = m % 12;
  if (!a) return r + (r === 1 ? ' mês' : ' meses');
  return a + (a === 1 ? ' ano' : ' anos') + (r ? ' e ' + r + (r === 1 ? ' mês' : ' meses') : '');
}
function vazio(texto) {
  return `<p class="hint" style="padding:6px 0; margin:0;">${esc(texto)}</p>`;
}
function erroHTML(e) {
  return `<div class="banner-alert"><span aria-hidden="true">&#9888;</span><span>${esc(e && e.message ? e.message : e)}</span></div>`;
}
function aviso(msg, tipo) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.className = 'toast ' + (tipo || 'ok');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._fim);
  t._fim = setTimeout(() => { t.hidden = true; }, 3800);
}
function valorForm(form, nome) {
  const el = form.elements[nome];
  if (!el) return null;
  const v = (el.value || '').trim();
  return v === '' ? null : v;
}
function marcados(form, nome) {
  return [...form.querySelectorAll(`input[name="${nome}"]:checked`)].map(i => i.value);
}

const ROTULOS = {
  grupo: { adulto: 'Adulto', pediatrico: 'Pediátrico' },
  estadoEtapa: { previsto: 'previsto', ativo: 'em curso', feito: 'feito', nao_aplicavel: 'não aplicável' },
  estadoMarcacao: { pedido: 'pedido', marcada: 'marcada', confirmada: 'confirmada', realizada: 'realizada', faltou: 'faltou', cancelada: 'cancelada' },
  respondente: { proprio: 'o próprio', cuidador: 'pais / cuidador', crianca_apoio: 'criança com apoio', professor: 'educador / professor', clinico: 'registado pela equipa' },
  relacao: { proprio: 'o próprio', mae: 'mãe', pai: 'pai', tutor: 'tutor', outro: 'outro' },
  apoio: { interprete_lgp: 'Intérprete de LGP presencial', interprete_video: 'Intérprete por videochamada', transcricao: 'Transcrição em tempo real', acompanhante: 'Acompanhante' },
  nivel: { alerta: 'pill-alert', aviso: 'pill-warn', info: 'pill-pending' }
};

/* ---------- menus ---------- */
const MENUS = {
  adulto: [
    { grupo: 'O meu acompanhamento' },
    { href: 'dashboard.html', txt: 'Início', ico: '&#127968;' },
    { href: 'jornada.html', txt: 'A minha jornada', ico: '&#128506;' },
    { href: 'marcacoes.html', txt: 'Marcações', ico: '&#128197;' },
    { grupo: 'A minha audição' },
    { href: 'audicao.html', txt: 'Resultados de audição', ico: '&#128266;' },
    { href: 'reabilitacao.html', txt: 'Treino em casa', ico: '&#127919;' },
    { href: 'questionarios.html', txt: 'Questionários', ico: '&#128221;' },
    { grupo: 'Apoio' },
    { href: 'mensagens.html', txt: 'Mensagens com a equipa', ico: '&#128172;' },
    { href: 'recursos.html', txt: 'Aprender sobre o implante', ico: '&#128218;' }
  ],
  pediatrico: [
    { grupo: 'O acompanhamento' },
    { href: 'dashboard.html', txt: 'Início', ico: '&#127968;' },
    { href: 'jornada.html', txt: 'A jornada', ico: '&#128506;' },
    { href: 'marcacoes.html', txt: 'Marcações', ico: '&#128197;' },
    { grupo: 'Em casa e na escola' },
    { href: 'treino.html', txt: 'Treino e escola', ico: '&#129504;' },
    { href: 'questionarios.html', txt: 'Questionários', ico: '&#128221;' },
    { grupo: 'Apoio' },
    { href: 'mensagens.html', txt: 'Mensagens com a equipa', ico: '&#128172;' },
    { href: 'recursos.html', txt: 'Para pais e famílias', ico: '&#128218;' }
  ],
  profissional: [
    { grupo: 'Centro' },
    { href: 'dashboard.html', txt: 'Doentes', ico: '&#128203;' },
    { href: 'novo-doente.html', txt: 'Novo doente', ico: '&#10133;' },
    { href: 'alertas.html', txt: 'Alertas', ico: '&#128276;', badge: 'badge-alertas' },
    { href: 'reuniao.html', txt: 'Reunião multidisciplinar', ico: '&#128101;' },
    { grupo: 'Conhecimento' },
    { href: 'instrumentos.html', txt: 'Questionários (PROMs)', ico: '&#128202;' },
    { href: 'indicadores.html', txt: 'Indicadores do centro', ico: '&#128200;' },
    { href: 'evidencia.html', txt: 'Evidência', ico: '&#128214;' }
  ]
};

/* ---------- cabeçalho + menu ---------- */
function montarShell(sessao) {
  const area = document.body.dataset.area;
  const pagina = document.body.dataset.pagina;
  const raiz = area ? '../' : '';
  const alvoTop = document.getElementById('topbar');

  let quem = '';
  if (sessao && sessao.papel === 'profissional') quem = esc(sessao.nome) + (sessao.especialidade ? ' &middot; ' + esc(sessao.especialidade) : '');
  else if (sessao && sessao.papel === 'utilizador') {
    quem = esc(sessao.nome);
    if (sessao.relacao && sessao.relacao !== 'proprio') quem += ' &middot; ' + esc(ROTULOS.relacao[sessao.relacao]) + ' de ' + esc((sessao.doente_nome || '').split(' ')[0]);
  }

  if (alvoTop) {
    alvoTop.innerHTML = `
    <header class="topbar">
      <div class="wrap">
        <div class="brandbar">
          ${area ? `<button class="btn btn-ghost btn-sm btn-menu" type="button" onclick="document.body.classList.toggle('menu-aberto')">&#9776; Menu</button>` : ''}
          <a class="brand" href="${raiz}index.html">
            <img src="${raiz}assets/img/soundbirth-icon.png" alt="SoundBirth">
            <span class="brand-name">SoundBirth<small>Implante coclear</small></span>
          </a>
          <span class="brand-divider"></span>
          <a class="uls-logo" href="${raiz}index.html">
            <span class="uls-text">Unidade Local de Saúde<small>São José &middot; CREIC</small></span>
          </a>
        </div>
        <nav>
          ${area && area !== 'profissional' ? `<span class="nav-tag">${area === 'pediatrico' ? 'Área pediátrica' : 'Área de adulto'}</span>` : ''}
          ${quem ? `<span class="badge-team">${quem}</span>` : ''}
          ${sessao ? `<button class="btn btn-ghost btn-sm" type="button" onclick="terminarSessao()">Sair</button>` : ''}
        </nav>
      </div>
    </header>`;
  }

  const alvoMenu = document.getElementById('sidebar');
  if (alvoMenu && MENUS[area]) {
    alvoMenu.innerHTML = MENUS[area].map(it => it.grupo
      ? `<p class="grupo">${it.grupo}</p>`
      : `<a href="${it.href}" class="${it.href === pagina ? 'active' : ''}"><span aria-hidden="true">${it.ico}</span> ${it.txt}${it.badge ? ` <span class="pill pill-alert" id="${it.badge}" hidden></span>` : ''}</a>`
    ).join('');
    alvoMenu.addEventListener('click', e => {
      if (e.target.closest('a')) document.body.classList.remove('menu-aberto');
    });
  }
}

async function terminarSessao() {
  await creicApi.logout();
  const raiz = document.body.dataset.area ? '../' : '';
  location.href = raiz + 'index.html#acesso';
}

/**
 * Guarda de acesso. Cada página chama no arranque:
 *   const sessao = await iniciarPagina();
 * A área vem de <body data-area="profissional|adulto|pediatrico">.
 * Devolve a sessão, ou null se a página for redirecionada ou não houver ligação.
 */
async function iniciarPagina() {
  const area = document.body.dataset.area;
  const raiz = '../';

  if (!window.creicApi || !creicApi.configurado) {
    montarShell(null);
    document.body.classList.remove('a-carregar');
    const main = document.querySelector('.main-area');
    if (main) main.innerHTML = `
      <div class="card" style="max-width:640px;">
        <p class="eyebrow">Plataforma por configurar</p>
        <h1 style="font-size:1.6rem;">Ainda sem ligação à base de dados</h1>
        <p style="color:var(--ink-soft);">Preencha <span class="mono">assets/js/supabase-config.js</span> com o
        Project URL e a anon key do projeto Supabase, e corra os ficheiros SQL da pasta
        <span class="mono">database/</span>. Os passos estão em <span class="mono">GUIA-SUPABASE.md</span>.</p>
      </div>`;
    return null;
  }

  let sessao;
  try {
    sessao = await creicApi.sessao();
  } catch (e) {
    montarShell(null);
    document.body.classList.remove('a-carregar');
    document.querySelector('.main-area').innerHTML = erroHTML(e);
    return null;
  }

  if (!sessao) { location.replace(raiz + 'index.html#acesso'); return null; }

  const destino = creicApi.destino(sessao);
  const certo = area === 'profissional' ? sessao.papel === 'profissional'
    : (sessao.papel === 'utilizador' && sessao.grupo === area);
  if (!certo) { location.replace(raiz + destino); return null; }

  montarShell(sessao);
  document.body.classList.remove('a-carregar');

  if (area === 'profissional') {
    creicApi.listarAlertas().then(a => {
      const b = document.getElementById('badge-alertas');
      if (b && a.length) { b.textContent = a.length; b.hidden = false; }
    }).catch(() => {});
  }
  return sessao;
}

/* ========================================================================
   A ONDA — a jornada como onda sonora
   fases: [{ fase, fase_curta, etapas: [{ id, titulo, quem, registo: { estado } }] }]
   (compatível com o formato antigo: fases + mapa de estados + etapa atual)
   ======================================================================== */
function desenharOnda(elId, fases, estados, etapaAtual) {
  const el = document.getElementById(elId);
  if (!el || !fases || !fases.length) return;

  const pontos = [];
  fases.forEach(f => f.etapas.forEach((e, ei) => {
    const estado = estados ? (estados[e.id] || 'previsto') : ((e.registo && e.registo.estado) || 'previsto');
    pontos.push({ id: e.id, titulo: e.titulo, quem: e.quem, fase: f.fase_curta || f.curto || f.fase, abreFase: ei === 0, estado });
  }));
  if (pontos.length < 2) return;

  let idxAtual = etapaAtual ? pontos.findIndex(p => p.id === etapaAtual) : pontos.findIndex(p => p.estado === 'ativo');
  if (idxAtual < 0) {
    const ultimaFeita = pontos.map(p => p.estado).lastIndexOf('feito');
    idxAtual = ultimaFeita;
  }

  const W = 1100, H = 190, m = 60;
  const passo = (W - m * 2) / (pontos.length - 1);
  const meio = 96;
  const amp = i => 6 + (28 * i / (pontos.length - 1));
  const y = i => meio + (i % 2 === 0 ? -amp(i) : amp(i));

  let d = `M ${m} ${y(0)}`, dFeito = `M ${m} ${y(0)}`;
  for (let i = 1; i < pontos.length; i++) {
    const x0 = m + passo * (i - 1), x1 = m + passo * i, xm = (x0 + x1) / 2;
    const seg = ` C ${xm} ${y(i - 1)}, ${xm} ${y(i)}, ${x1} ${y(i)}`;
    d += seg;
    if (idxAtual >= 0 && i <= idxAtual) dFeito += seg;
  }

  const nos = pontos.map((p, i) => {
    const cls = p.estado === 'feito' ? 'done' : (p.estado === 'ativo' ? 'active' : '');
    const rotulo = p.abreFase
      ? `<text class="label" x="${m + passo * i}" y="28" text-anchor="${i === 0 ? 'start' : 'middle'}">${esc(p.fase)}</text>
         <line x1="${m + passo * i}" y1="36" x2="${m + passo * i}" y2="${y(i) - 12}" stroke="currentColor" opacity=".18"/>`
      : '';
    const agora = (i === idxAtual && p.estado === 'ativo')
      ? `<text class="date" x="${m + passo * i}" y="${H - 14}" text-anchor="middle">está aqui</text>` : '';
    return `<g class="onda-node ${cls}">
      <title>${esc(p.titulo)}${p.quem ? ' — ' + esc(p.quem) : ''} (${ROTULOS.estadoEtapa[p.estado] || p.estado})</title>
      <circle cx="${m + passo * i}" cy="${y(i)}" r="${i === idxAtual && p.estado === 'ativo' ? 9 : 6.5}"/>
      ${rotulo}${agora}
    </g>`;
  }).join('');

  const feitas = pontos.filter(p => p.estado === 'feito').length;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Jornada do implante coclear: ${feitas} de ${pontos.length} etapas cumpridas">
      <path class="onda-bg" d="${d}"/>
      ${idxAtual > 0 ? `<path class="onda-fg" d="${dFeito}"/>` : ''}
      ${nos}
    </svg>`;
}

/* ---------- lista detalhada da jornada (usada nas duas áreas) ---------- */
function htmlJornada(fases, opcoes) {
  const o = Object.assign({ simples: false, evidencia: false }, opcoes || {});
  const marca = { feito: '&#10003;', ativo: '&#9679;', previsto: '', nao_aplicavel: '&ndash;' };
  return fases.map((f, i) => `
    <section class="fase">
      <div class="fase-head">
        <span class="fase-num">${i + 1}</span>
        <h2>${esc(f.fase)}</h2>
      </div>
      ${f.etapas.map(e => {
        const r = e.registo || {};
        const s = r.estado || 'previsto';
        const cls = s === 'feito' ? 'is-done' : (s === 'ativo' ? 'is-active' : (s === 'nao_aplicavel' ? 'is-blocked' : ''));
        const data = s === 'feito' && r.data_efetiva ? fmtData(r.data_efetiva)
          : (s === 'ativo' && r.iniciada_em ? 'desde ' + fmtData(r.iniciada_em) : (r.data_prevista ? 'prevista ' + fmtData(r.data_prevista) : ''));
        return `<article class="etapa ${cls}">
          <span class="etapa-marca" aria-hidden="true">${marca[s]}</span>
          <div class="etapa-corpo">
            <h3 class="etapa-titulo">${esc(o.simples && e.titulo_simples ? e.titulo_simples : e.titulo)}</h3>
            <div class="etapa-meta">
              ${e.quem ? `<span class="etapa-tag">${esc(e.quem)}</span>` : ''}
              ${e.prazo_texto && e.prazo_texto !== '—' ? `<span class="etapa-tag">${esc(e.prazo_texto)}</span>` : ''}
              ${data ? `<span class="pill ${s === 'feito' ? 'pill-ok' : 'pill-pending'}">${esc(data)}</span>` : ''}
            </div>
            ${e.nota ? `<p>${esc(e.nota)}</p>` : ''}
            ${r.observacoes ? `<p style="margin-top:6px;"><strong>Nota da equipa:</strong> ${esc(r.observacoes)}</p>` : ''}
            ${o.evidencia && e.evidencia ? `<p class="evidencia">${esc(e.evidencia)}</p>` : ''}
          </div>
        </article>`;
      }).join('')}
    </section>`).join('');
}

/* ---------- audiograma (dB HL por frequência, eixo invertido) ---------- */
function desenharAudiograma(elId, series) {
  // series: [{ rotulo, cor, marca: 'x'|'o', tonal: {"250": 75, ...} }]
  const el = document.getElementById(elId);
  if (!el) return;
  const fs = [250, 500, 1000, 2000, 4000, 8000];
  const W = 620, H = 380, ml = 56, mr = 20, mt = 24, mb = 46;
  const x = i => ml + (W - ml - mr) * i / (fs.length - 1);
  const yv = db => mt + (H - mt - mb) * (db + 10) / 130;

  let grelha = '';
  for (let db = 0; db <= 120; db += 20) {
    grelha += `<line x1="${ml}" y1="${yv(db)}" x2="${W - mr}" y2="${yv(db)}" stroke="#DAE4EA"/>
      <text x="${ml - 10}" y="${yv(db) + 4}" text-anchor="end" font-size="11" fill="#4C6376" font-family="IBM Plex Mono,monospace">${db}</text>`;
  }
  fs.forEach((f, i) => {
    grelha += `<line x1="${x(i)}" y1="${mt}" x2="${x(i)}" y2="${H - mb}" stroke="#EDF2F5"/>
      <text x="${x(i)}" y="${H - mb + 20}" text-anchor="middle" font-size="11" fill="#4C6376" font-family="IBM Plex Mono,monospace">${f >= 1000 ? (f / 1000) + 'k' : f}</text>`;
  });
  const faixa = `<rect x="${x(1)}" y="${yv(25)}" width="${x(4) - x(1)}" height="${yv(60) - yv(25)}" fill="#5AC8C8" opacity=".12"/>
    <text x="${(x(1) + x(4)) / 2}" y="${yv(42)}" text-anchor="middle" font-size="11" fill="#0E8C95">zona da fala</text>`;

  const serie = s => {
    const pts = fs.map((f, i) => s.tonal && s.tonal[f] != null ? [x(i), yv(Number(s.tonal[f]))] : null).filter(Boolean);
    if (!pts.length) return '';
    const marcas = pts.map(([px, py]) => s.marca === 'x'
      ? `<path d="M${px - 5},${py - 5} L${px + 5},${py + 5} M${px + 5},${py - 5} L${px - 5},${py + 5}" stroke="${s.cor}" stroke-width="2.2"/>`
      : `<circle cx="${px}" cy="${py}" r="5" fill="none" stroke="${s.cor}" stroke-width="2.2"/>`).join('');
    return `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${s.cor}" stroke-width="2.2"/>${marcas}`;
  };

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Audiograma: ${series.map(s => esc(s.rotulo)).join('; ')}">
    ${faixa}${grelha}
    <text x="14" y="${(mt + H - mb) / 2}" transform="rotate(-90 14 ${(mt + H - mb) / 2})" text-anchor="middle" font-size="11" fill="#4C6376">dB HL</text>
    ${series.map(serie).join('')}
  </svg>
  <div class="legenda">${series.map(s => `<span><i style="background:${s.cor}"></i>${esc(s.rotulo)}</span>`).join('')}</div>`;
}

/* ---------- barras simples ---------- */
function desenharBarras(elId, valores, rotulos, opcoes) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!valores.length) { el.innerHTML = vazio('Ainda sem dados.'); return; }
  const o = Object.assign({ max: 12, unidade: 'h', cor: '#0E8C95', alvo: null, alvoTxt: '' }, opcoes || {});
  const W = 620, H = 220, ml = 34, mb = 38, mt = 16;
  const larg = (W - ml - 16) / valores.length;
  const y = v => mt + (H - mt - mb) * (1 - Math.min(v, o.max) / o.max);

  const barras = valores.map((v, i) => `
    <rect x="${ml + larg * i + larg * 0.18}" y="${y(v)}" width="${larg * 0.64}" height="${H - mb - y(v)}"
          rx="3" fill="${o.cor}" opacity="${.55 + .45 * i / valores.length}"><title>${esc(rotulos[i])}: ${num(v)}${o.unidade}</title></rect>
    <text x="${ml + larg * i + larg / 2}" y="${y(v) - 6}" text-anchor="middle" font-size="11"
          fill="#0F2233" font-family="IBM Plex Mono,monospace">${num(v)}</text>
    <text x="${ml + larg * i + larg / 2}" y="${H - mb + 18}" text-anchor="middle" font-size="10.5" fill="#4C6376">${esc(rotulos[i])}</text>`).join('');

  const linhaAlvo = o.alvo == null ? '' : `
    <line x1="${ml}" y1="${y(o.alvo)}" x2="${W - 16}" y2="${y(o.alvo)}" stroke="#B8791C" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="${W - 18}" y="${y(o.alvo) - 6}" text-anchor="end" font-size="10.5" fill="#B8791C">${esc(o.alvoTxt)}</text>`;

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.descricao || 'Gráfico de barras')}">
    <line x1="${ml}" y1="${H - mb}" x2="${W - 16}" y2="${H - mb}" stroke="#DAE4EA"/>
    ${linhaAlvo}${barras}
  </svg>`;
}

/* páginas públicas (index, ativar-conta) montam o cabeçalho sem guarda */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.dataset.area) montarShell(null);
});
