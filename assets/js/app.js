/* ========================================================================
   ESCUTA — comportamento comum do esboco
   Constroi o cabecalho e o menu lateral a partir de data-area/data-pagina
   no <body>, e desenha os graficos em SVG (sem bibliotecas externas).
   ======================================================================== */

/* ---------- logotipo SoundBirth ---------- */
function logoImg(raiz){
  return `<img src="${raiz}assets/img/soundbirth-icon.png" alt="SoundBirth">`;
}

/* ---------- menus ---------- */
const MENUS = {
  doente: [
    { grupo:'O meu acompanhamento' },
    { href:'dashboard.html',     txt:'Início',                 ico:'&#127968;' },
    { href:'jornada.html',       txt:'A minha jornada',        ico:'&#128506;' },
    { href:'marcacoes.html',     txt:'Marcações',              ico:'&#128197;' },
    { grupo:'A minha audição' },
    { href:'audicao.html',       txt:'Resultados de audição',  ico:'&#128266;' },
    { href:'reabilitacao.html',  txt:'Treino em casa',         ico:'&#127919;' },
    { href:'questionarios.html', txt:'Questionários',          ico:'&#128221;' },
    { grupo:'Apoio' },
    { href:'mensagens.html',     txt:'Mensagens com a equipa', ico:'&#128172;' },
    { href:'recursos.html',      txt:'Aprender sobre o implante', ico:'&#128218;' }
  ],
  /* Área da família: 0 aos 18 anos. Quem entra aqui é o pai, a mãe ou o
     cuidador — e, à medida que cresce, o próprio jovem. */
  familia: [
    { grupo:'O acompanhamento da Laura' },
    { href:'dashboard.html',     txt:'Início',               ico:'&#127968;' },
    { href:'jornada.html',       txt:'A jornada da Laura',   ico:'&#128506;' },
    { href:'marcacoes.html',     txt:'Marcações',            ico:'&#128197;' },
    { grupo:'Em casa e na creche' },
    { href:'treino.html',        txt:'Treino e escola',      ico:'&#129504;' },
    { href:'questionarios.html', txt:'Questionários',        ico:'&#128221;' },
    { grupo:'Apoio' },
    { href:'mensagens.html',     txt:'Mensagens com a equipa', ico:'&#128172;' },
    { href:'recursos.html',      txt:'Para pais e famílias', ico:'&#128218;' }
  ],
  profissional: [
    { grupo:'Centro' },
    { href:'dashboard.html', txt:'Doentes',                ico:'&#128203;' },
    { href:'alertas.html',   txt:'Alertas',                ico:'&#128276;' },
    { href:'reuniao.html',   txt:'Reunião multidisciplinar', ico:'&#128101;' },
    { grupo:'Percurso' },
    { href:'doente.html',    txt:'Ficha do doente',        ico:'&#128100;' },
    { href:'instrumentos.html', txt:'Questionários (PROMs)', ico:'&#128202;' },
    { href:'indicadores.html', txt:'Indicadores do centro',ico:'&#128200;' }
  ]
};

/* ---------- cabecalho + menu ---------- */
function montarShell(){
  const area = document.body.dataset.area;      // 'doente' | 'profissional' | undefined
  const pagina = document.body.dataset.pagina;
  const raiz = area ? '../' : '';
  const alvoTop = document.getElementById('topbar');

  const quem = { profissional: 'Dra. Inês Câmara &middot; Audiologia',
                 familia:      'Marta Pinto &middot; mãe da Laura',
                 doente:       'Manuel Torres Ribeiro &middot; CREIC-0142' }[area];

  if (alvoTop){
    alvoTop.innerHTML = `
    <header class="topbar">
      <div class="wrap">
        <div class="brandbar">
          ${area ? `<button class="btn btn-ghost btn-sm btn-menu" onclick="document.body.classList.toggle('menu-aberto')">&#9776; Menu</button>` : ''}
          <a class="brand" href="${raiz}index.html">
            ${logoImg(raiz)}
            <span class="brand-name">SoundBirth<small>Implante coclear</small></span>
          </a>
          <span class="brand-divider"></span>
          <a class="uls-logo" href="${raiz}index.html">
            <span class="uls-text">Unidade Local de Saúde<small>São José &middot; CREIC</small></span>
          </a>
        </div>
        <nav>
          <span class="nav-tag">Esboço &middot; dados fictícios</span>
          ${area ? `<span class="badge-team">${quem}</span>
          <a class="btn btn-ghost btn-sm" href="${raiz}index.html">Sair</a>` : ''}
        </nav>
      </div>
    </header>`;
  }

  const alvoMenu = document.getElementById('sidebar');
  if (alvoMenu && area){
    alvoMenu.innerHTML = MENUS[area].map(it => it.grupo
      ? `<p class="grupo">${it.grupo}</p>`
      : `<a href="${it.href}" class="${it.href === pagina ? 'active' : ''}"><span aria-hidden="true">${it.ico}</span> ${it.txt}</a>`
    ).join('');
    alvoMenu.addEventListener('click', e => {
      if (e.target.closest('a')) document.body.classList.remove('menu-aberto');
    });
  }
}

/* ========================================================================
   A ONDA — jornada como onda sonora. Os nos cumpridos ficam cheios, o no
   atual fica aberto, e a amplitude cresce da esquerda para a direita:
   quanto mais avancado o percurso, mais "som" tem a linha.
   ======================================================================== */
function desenharOnda(elId, fases, estados, etapaAtual){
  const el = document.getElementById(elId);
  if (!el) return;

  // vinte etapas nao cabem rotuladas uma a uma: escreve-se o nome da fase
  // sobre a primeira etapa de cada uma, e o resto fica no tooltip
  const pontos = [];
  fases.forEach((f, fi) => f.etapas.forEach((e, ei) => pontos.push(
    Object.assign({ fase: f.curto || f.fase, abreFase: ei === 0, faseIdx: fi }, e))));

  const W = 1100, H = 190, m = 60;
  const passo = (W - m*2) / (pontos.length - 1);
  const meio = 96;

  // amplitude crescente: 6px no inicio, 34px no fim
  const amp = i => 6 + (28 * i / (pontos.length - 1));
  const y = i => meio + (i % 2 === 0 ? -amp(i) : amp(i));

  const idxAtual = pontos.findIndex(p => p.id === etapaAtual);

  // um traco por segmento: assim o percurso ja cumprido e desenhado com o
  // mesmo caminho do fundo, sem depender do comprimento da curva
  let d = `M ${m} ${y(0)}`, dFeito = `M ${m} ${y(0)}`;
  for (let i = 1; i < pontos.length; i++){
    const x0 = m + passo*(i-1), x1 = m + passo*i, xm = (x0+x1)/2;
    const seg = ` C ${xm} ${y(i-1)}, ${xm} ${y(i)}, ${x1} ${y(i)}`;
    d += seg;
    if (idxAtual < 0 || i <= idxAtual) dFeito += seg;
  }
  const nos = pontos.map((p, i) => {
    const estado = estados[p.id] || 'previsto';
    const cls = estado === 'feito' ? 'done' : (estado === 'ativo' ? 'active' : '');
    // o nome da fase no alto, a etapa atual identificada em baixo
    const rotulo = p.abreFase
      ? `<text class="label" x="${m + passo*i}" y="28" text-anchor="${i === 0 ? 'start' : 'middle'}">${p.fase}</text>
         <line x1="${m + passo*i}" y1="36" x2="${m + passo*i}" y2="${y(i)-12}" stroke="currentColor" opacity=".18"/>`
      : '';
    const agora = i === idxAtual
      ? `<text class="date" x="${m + passo*i}" y="${H-14}" text-anchor="middle">está aqui</text>`
      : '';
    return `<g class="onda-node ${cls}">
      <title>${p.titulo} — ${p.quem}</title>
      <circle cx="${m + passo*i}" cy="${y(i)}" r="${i === idxAtual ? 9 : 6.5}"/>
      ${rotulo}${agora}
    </g>`;
  }).join('');

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Jornada do implante coclear: ${pontos.filter(p=>estados[p.id]==='feito').length} de ${pontos.length} etapas cumpridas">
      <path class="onda-bg" d="${d}"/>
      <path class="onda-fg" d="${dFeito}"/>
      ${nos}
    </svg>`;
}

/* ---------- audiograma (dB HL por frequencia, eixo invertido) ---------- */
function desenharAudiograma(elId, dados){
  const el = document.getElementById(elId);
  if (!el) return;
  const W = 620, H = 380, ml = 56, mr = 20, mt = 24, mb = 46;
  const fs = dados.frequencias;
  const x = i => ml + (W - ml - mr) * i / (fs.length - 1);
  const yv = db => mt + (H - mt - mb) * (db + 10) / 130;   // -10 a 120 dB

  let grelha = '';
  for (let db = 0; db <= 120; db += 20){
    grelha += `<line x1="${ml}" y1="${yv(db)}" x2="${W-mr}" y2="${yv(db)}" stroke="#DAE4EA"/>
      <text x="${ml-10}" y="${yv(db)+4}" text-anchor="end" font-size="11" fill="#4C6376" font-family="IBM Plex Mono,monospace">${db}</text>`;
  }
  fs.forEach((f, i) => {
    grelha += `<line x1="${x(i)}" y1="${mt}" x2="${x(i)}" y2="${H-mb}" stroke="#EDF2F5"/>
      <text x="${x(i)}" y="${H-mb+20}" text-anchor="middle" font-size="11" fill="#4C6376" font-family="IBM Plex Mono,monospace">${f >= 1000 ? (f/1000)+'k' : f}</text>`;
  });

  // faixa da fala ("banana da fala"): onde vivem os sons da conversa
  const faixa = `<rect x="${x(1)}" y="${yv(25)}" width="${x(4)-x(1)}" height="${yv(60)-yv(25)}"
      fill="#5AC8C8" opacity=".12"/>
    <text x="${(x(1)+x(4))/2}" y="${yv(42)}" text-anchor="middle" font-size="11" fill="#0E8C95">zona da fala</text>`;

  const serie = (vals, cor, marca) => {
    const pts = vals.map((v, i) => `${x(i)},${yv(v)}`).join(' ');
    const marcas = vals.map((v, i) => marca === 'x'
      ? `<path d="M${x(i)-5},${yv(v)-5} L${x(i)+5},${yv(v)+5} M${x(i)+5},${yv(v)-5} L${x(i)-5},${yv(v)+5}" stroke="${cor}" stroke-width="2.2"/>`
      : `<circle cx="${x(i)}" cy="${yv(v)}" r="5" fill="none" stroke="${cor}" stroke-width="2.2"/>`).join('');
    return `<polyline points="${pts}" fill="none" stroke="${cor}" stroke-width="2.2"/>${marcas}`;
  };

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Audiograma em campo livre: com protese entre 75 e 110 decibeis; com implante entre 25 e 45 decibeis">
    ${faixa}${grelha}
    <text x="14" y="${(mt+H-mb)/2}" transform="rotate(-90 14 ${(mt+H-mb)/2})" text-anchor="middle" font-size="11" fill="#4C6376">dB HL</text>
    ${serie(dados.comProtese, '#C24A33', 'x')}
    ${serie(dados.comImplante, '#0E8C95', 'o')}
  </svg>
  <div class="legenda">
    <span><i style="background:#C24A33"></i>Antes: com protese auditiva</span>
    <span><i style="background:#0E8C95"></i>Agora: com implante coclear</span>
  </div>`;
}

/* ---------- barras simples (uso diario, discriminacao) ---------- */
/* em portugues o separador decimal e a virgula: 8,6 e nao 8.6 */
function num(v){ return String(v).replace('.', ','); }

function desenharBarras(elId, valores, rotulos, opcoes){
  const el = document.getElementById(elId);
  if (!el) return;
  const o = Object.assign({ max:12, unidade:'h', cor:'#0E8C95', alvo:null, alvoTxt:'' }, opcoes || {});
  const W = 620, H = 220, ml = 34, mb = 38, mt = 16;
  const larg = (W - ml - 16) / valores.length;
  const y = v => mt + (H - mt - mb) * (1 - v / o.max);

  const barras = valores.map((v, i) => `
    <rect x="${ml + larg*i + larg*0.18}" y="${y(v)}" width="${larg*0.64}" height="${H - mb - y(v)}"
          rx="3" fill="${o.cor}" opacity="${.55 + .45*i/valores.length}"><title>${rotulos[i]}: ${num(v)}${o.unidade}</title></rect>
    <text x="${ml + larg*i + larg/2}" y="${y(v)-6}" text-anchor="middle" font-size="11"
          fill="#0F2233" font-family="IBM Plex Mono,monospace">${num(v)}</text>
    <text x="${ml + larg*i + larg/2}" y="${H-mb+18}" text-anchor="middle" font-size="10.5" fill="#4C6376">${rotulos[i]}</text>`).join('');

  const linhaAlvo = o.alvo == null ? '' : `
    <line x1="${ml}" y1="${y(o.alvo)}" x2="${W-16}" y2="${y(o.alvo)}" stroke="#B8791C" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="${W-18}" y="${y(o.alvo)-6}" text-anchor="end" font-size="10.5" fill="#B8791C">${o.alvoTxt}</text>`;

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img"
      aria-label="${o.descricao || 'Grafico de barras'}">
    <line x1="${ml}" y1="${H-mb}" x2="${W-16}" y2="${H-mb}" stroke="#DAE4EA"/>
    ${linhaAlvo}${barras}
  </svg>`;
}

document.addEventListener('DOMContentLoaded', montarShell);
