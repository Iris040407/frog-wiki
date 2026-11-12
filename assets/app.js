/**
 * 台灣蛙類圖鑑 — 清新手帳風邏輯 (assets/app.js)
 * 負責：Markdown 讀取、Frontmatter 解析、蛙類卡牌羅列與籌備中預告、
 *       專屬青蛙圖徽、物種獨立手帳頁、持續更新連載看板與觀察筆記格、目錄導覽
 */

const content = document.getElementById('content');
const nav = document.getElementById('nav');

// --- 1. 資料解析工具 ---

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  m[1].split('\n').forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) {
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      meta[key] = val;
    }
  });
  return { meta, body: text.slice(m[0].length) };
}

function wikiLinks(md) {
  return md.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    const parts = raw.split('|');
    const target = parts[0].trim();
    const label = parts[1] ? parts[1].trim() : target.split('/').pop();
    return `[${label}](#${encodeURIComponent(target)})`;
  });
}

async function getText(name) {
  if (location.protocol.startsWith('http')) {
    try {
      const res = await fetch('wiki/' + name + '.md');
      if (res.ok) return await res.text();
    } catch (e) { /* 降級使用 WIKI 內嵌物件 */ }
  }
  if (window.WIKI && window.WIKI[name] !== undefined) {
    return window.WIKI[name];
  }
  throw new Error('找不到頁面: ' + name);
}

// --- 2. 物種資料解析 ---

function parseSpeciesMarkdown(text, path) {
  const { meta, body } = parseFrontmatter(text);
  const title = meta.title || path.split('/').pop();
  
  const sections = {};
  const parts = body.split(/\n(?=##\s+)/);
  
  let headerText = parts[0] || '';
  let summary = '';
  const sumMatch = headerText.match(/#[^\n]+\n+([\s\S]+?)(?=\n##|\n$)/);
  if (sumMatch) {
    summary = sumMatch[1].trim();
    // 移除開頭的 Markdown 圖片語法與說明文字，保持純文字摘要簡介
    summary = summary.replace(/!\[[^\]]*\]\([^)]+\)/g, '').replace(/\*▲[^*]+\*/g, '').trim();
  }

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i].trim();
    const firstLineEnd = p.indexOf('\n');
    if (firstLineEnd > 0) {
      const heading = p.slice(0, firstLineEnd).replace(/^##\s+/, '').trim();
      const content = p.slice(firstLineEnd + 1).trim();
      sections[heading] = content;
    }
  }

  const stats = {
    '學名': meta.scientific_name || '待查證',
    '科': meta.family || '待查證',
    '體長': '待查證',
    '分布與棲地': '待查證',
    '活動季節': '待查證',
    '保育等級': '待查證'
  };

  if (sections['基本資料']) {
    const rows = sections['基本資料'].split('\n');
    rows.forEach(r => {
      const cols = r.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 2 && cols[0] !== '項目' && !cols[0].startsWith('---')) {
        stats[cols[0]] = cols[1];
      }
    });
  }

  const tags = Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []);

  return {
    id: path,
    title,
    scientificName: meta.scientific_name || stats['學名'] || '待查證',
    family: meta.family || stats['科'] || '待查證',
    tags,
    summary,
    image: meta.image || null,
    imageCaption: meta.image_caption || '',
    imageSource: meta.image_source || '',
    imageLicense: meta.image_license || '',
    stats,
    sections,
    meta,
    rawBody: body
  };
}

async function getAllSpeciesList() {
  const speciesKeys = [];
  
  if (window.WIKI) {
    Object.keys(window.WIKI).forEach(k => {
      if (k.startsWith('species/')) speciesKeys.push(k);
    });
  }

  const defaultOrder = [
    'species/諸羅樹蛙',
    'species/台北樹蛙',
    'species/褐樹蛙',
    'species/斯文豪氏赤蛙',
    'species/拉都希氏赤蛙',
    'species/澤蛙',
    'species/莫氏樹蛙'
  ];

  const keys = Array.from(new Set([...defaultOrder, ...speciesKeys]));
  const list = [];

  for (const k of keys) {
    try {
      const text = await getText(k);
      list.push(parseSpeciesMarkdown(text, k));
    } catch (e) {
      // 忽略未建立檔案
    }
  }

  return list;
}

// 產生青蛙手帳專屬向量圖徽 (依物種外觀辨識特徵客製化)
function getFrogAvatarSvg(speciesName) {
  if (speciesName.includes('台北樹蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#3ea85c" />
        <ellipse cx="38" cy="45" rx="14" ry="12" fill="#fefae0" opacity="0.9" />
        <path d="M20 46Q14 42 16 34" stroke="#3ea85c" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="16" cy="33" r="3.2" fill="#2d8745" />
        <path d="M56 46Q62 42 60 34" stroke="#3ea85c" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="60" cy="33" r="3.2" fill="#2d8745" />
        <circle cx="26" cy="24" r="8" fill="#3ea85c" />
        <circle cx="50" cy="24" r="8" fill="#3ea85c" />
        <circle cx="26" cy="23" r="6" fill="#ffffff" />
        <circle cx="50" cy="23" r="6" fill="#ffffff" />
        <circle cx="27" cy="23" r="3.2" fill="#1b3820" />
        <circle cx="49" cy="23" r="3.2" fill="#1b3820" />
        <circle cx="29" cy="21" r="1.3" fill="#ffffff" />
        <circle cx="51" cy="21" r="1.3" fill="#ffffff" />
        <path d="M31 35Q38 40 45 35" stroke="#1d4022" stroke-width="2.2" stroke-linecap="round" />
        <ellipse cx="23" cy="36" rx="3.5" ry="2" fill="#f8b6af" opacity="0.65" />
        <ellipse cx="53" cy="36" rx="3.5" ry="2" fill="#f8b6af" opacity="0.65" />
      </svg>
    `;
  } else if (speciesName.includes('諸羅樹蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#35a34e" />
        <ellipse cx="38" cy="46" rx="13" ry="11" fill="#f8fdf6" opacity="0.9" />
        <path d="M19 33C16 38 16 48 24 56" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" />
        <path d="M20 34C17 39 17 49 25 57" stroke="#153d1e" stroke-width="1.2" stroke-linecap="round" />
        <path d="M57 33C60 38 60 48 52 56" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" />
        <path d="M56 34C59 39 59 49 51 57" stroke="#153d1e" stroke-width="1.2" stroke-linecap="round" />
        <circle cx="26" cy="24" r="8" fill="#35a34e" />
        <circle cx="50" cy="24" r="8" fill="#35a34e" />
        <circle cx="26" cy="23" r="6" fill="#fbfdf9" />
        <circle cx="50" cy="23" r="6" fill="#fbfdf9" />
        <circle cx="27" cy="23" r="3.4" fill="#15361b" />
        <circle cx="49" cy="23" r="3.4" fill="#15361b" />
        <path d="M32 35Q38 38 44 35" stroke="#15361b" stroke-width="2" stroke-linecap="round" />
        <circle cx="15" cy="53" r="3.2" fill="#258239" />
        <circle cx="61" cy="53" r="3.2" fill="#258239" />
      </svg>
    `;
  } else if (speciesName.includes('褐樹蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#7a6242" />
        <ellipse cx="38" cy="45" rx="14" ry="11" fill="#ede5d8" opacity="0.88" />
        <polygon points="38,26 31,37 45,37" fill="#f4ebd9" opacity="0.95" />
        <polygon points="38,26 31,37 45,37" stroke="#5a4428" stroke-width="1.2" fill="none" />
        <circle cx="25" cy="24" r="8" fill="#7a6242" />
        <circle cx="51" cy="24" r="8" fill="#7a6242" />
        <circle cx="25" cy="23" r="6" fill="#f7f2ea" />
        <circle cx="51" cy="23" r="6" fill="#f7f2ea" />
        <circle cx="26" cy="23" r="3.3" fill="#2c1e0e" />
        <circle cx="50" cy="23" r="3.3" fill="#2c1e0e" />
        <path d="M32 40Q38 43 44 40" stroke="#3d2a15" stroke-width="2" stroke-linecap="round" />
        <circle cx="15" cy="42" r="3.2" fill="#5e492e" />
        <circle cx="61" cy="42" r="3.2" fill="#5e492e" />
      </svg>
    `;
  } else if (speciesName.includes('斯文豪氏赤蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#4d6f51" />
        <circle cx="31" cy="40" r="2.5" fill="#29402c" opacity="0.7" />
        <circle cx="44" cy="42" r="3" fill="#29402c" opacity="0.7" />
        <circle cx="37" cy="50" r="2.8" fill="#29402c" opacity="0.6" />
        <path d="M21 34L22 40M23 44L24 52" stroke="#6f9173" stroke-width="2" stroke-linecap="round" />
        <path d="M55 34L54 40M53 44L52 52" stroke="#6f9173" stroke-width="2" stroke-linecap="round" />
        <ellipse cx="38" cy="37" rx="5" ry="3.5" fill="#1b2e1e" />
        <text x="56" y="22" font-size="12" fill="#2d5e35" font-family="sans-serif" font-weight="bold">🎵</text>
        <circle cx="26" cy="24" r="8" fill="#4d6f51" />
        <circle cx="50" cy="24" r="8" fill="#4d6f51" />
        <circle cx="26" cy="23" r="6" fill="#fdfefa" />
        <circle cx="50" cy="23" r="6" fill="#fdfefa" />
        <circle cx="27" cy="23" r="3.3" fill="#162b19" />
        <circle cx="49" cy="23" r="3.3" fill="#162b19" />
      </svg>
    `;
  } else if (speciesName.includes('拉都希氏赤蛙') || speciesName.includes('拉都西氏赤蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="43" rx="23" ry="19" fill="#884938" />
        <ellipse cx="38" cy="47" rx="13" ry="11" fill="#f3dfd7" opacity="0.85" />
        <path d="M20 31C18 38 18 48 24 57" stroke="#4a1e12" stroke-width="3.5" stroke-linecap="round" />
        <path d="M56 31C58 38 58 48 52 57" stroke="#4a1e12" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="32" cy="42" r="1.5" fill="#4a1e12" opacity="0.5" />
        <circle cx="43" cy="44" r="1.5" fill="#4a1e12" opacity="0.5" />
        <circle cx="26" cy="25" r="7.5" fill="#884938" />
        <circle cx="50" cy="25" r="7.5" fill="#884938" />
        <circle cx="26" cy="24" r="5.5" fill="#fdf8f5" />
        <circle cx="50" cy="24" r="5.5" fill="#fdf8f5" />
        <circle cx="27" cy="24" r="3" fill="#301109" />
        <circle cx="49" cy="24" r="3" fill="#301109" />
        <path d="M30 36Q38 41 46 36" stroke="#301109" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    `;
  } else if (speciesName.includes('澤蛙') || speciesName.includes('澤樹蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#6d6a5f" />
        <path d="M28 28L38 35L48 28" stroke="#25241f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M24 45L31 51L38 46L45 51L52 45" stroke="#25241f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <ellipse cx="38" cy="41" rx="9" ry="5.5" fill="#1f1e1a" opacity="0.75" />
        <circle cx="26" cy="24" r="8" fill="#6d6a5f" />
        <circle cx="50" cy="24" r="8" fill="#6d6a5f" />
        <circle cx="26" cy="23" r="6" fill="#f7f7f4" />
        <circle cx="50" cy="23" r="6" fill="#f7f7f4" />
        <circle cx="27" cy="23" r="3.2" fill="#181714" />
        <circle cx="49" cy="23" r="3.2" fill="#181714" />
      </svg>
    `;
  } else if (speciesName.includes('莫氏樹蛙')) {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#2d9348" />
        <ellipse cx="38" cy="46" rx="14" ry="11" fill="#fefae0" opacity="0.9" />
        <circle cx="26" cy="24" r="8" fill="#2d9348" />
        <circle cx="50" cy="24" r="8" fill="#2d9348" />
        <circle cx="26" cy="23" r="6.2" fill="#e85d04" />
        <circle cx="50" cy="23" r="6.2" fill="#e85d04" />
        <circle cx="27" cy="23" r="3.2" fill="#1b120c" />
        <circle cx="49" cy="23" r="3.2" fill="#1b120c" />
        <circle cx="29" cy="21" r="1.3" fill="#ffffff" />
        <circle cx="51" cy="21" r="1.3" fill="#ffffff" />
        <path d="M19 46Q14 42 16 34" stroke="#2d9348" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="16" cy="33" r="3.2" fill="#217036" />
        <path d="M57 46Q62 42 60 34" stroke="#2d9348" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="60" cy="33" r="3.2" fill="#217036" />
        <path d="M18 52Q20 58 26 56" stroke="#d90429" stroke-width="4" stroke-linecap="round" />
        <circle cx="21" cy="54" r="1.5" fill="#201010" />
        <circle cx="24" cy="55" r="1.2" fill="#201010" />
        <path d="M58 52Q56 58 50 56" stroke="#d90429" stroke-width="4" stroke-linecap="round" />
        <circle cx="55" cy="54" r="1.5" fill="#201010" />
        <circle cx="52" cy="55" r="1.2" fill="#201010" />
        <path d="M32 37Q38 41 44 37" stroke="#12361a" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;
  } else {
    return `
      <svg class="frog-avatar-svg" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="38" cy="42" rx="22" ry="19" fill="#3e7b4a" />
        <ellipse cx="38" cy="45" rx="13" ry="10" fill="#f4f8ee" opacity="0.85" />
        <circle cx="26" cy="24" r="8" fill="#3e7b4a" />
        <circle cx="50" cy="24" r="8" fill="#3e7b4a" />
        <circle cx="26" cy="23" r="6" fill="#fdfefa" />
        <circle cx="50" cy="23" r="6" fill="#fdfefa" />
        <circle cx="27" cy="23" r="3" fill="#1e3020" />
        <circle cx="49" cy="23" r="3" fill="#1e3020" />
        <path d="M31 35Q38 39 45 35" stroke="#1b301e" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;
  }
}

function getFrogFootprintsHtml() {
  return `
    <div class="frog-footprints" aria-hidden="true">
      <span class="foot-pad">🐾</span>
      <span class="foot-pad">🐾</span>
      <span class="foot-pad">🐾</span>
      <span class="foot-frog">🐸～*</span>
    </div>
  `;
}

// --- 3. 手帳連載即時看板 (Live Progress Banner) ---

function renderLiveProgressBanner() {
  return `
    <div class="live-progress-banner">
      <div class="progress-banner-top">
        <div class="pulse-indicator-badge">
          <span class="live-status-dot"></span>
          <span class="pulse-text">LIVE · 台灣兩棲生態手帳持續連載中</span>
        </div>
        <div class="live-update-timestamp">
          <span>⏱️ 最新手帳更新：2026-11-12（今日活躍）</span>
        </div>
      </div>

      <div class="progress-bar-container" onclick="document.getElementById('checklist36Section')?.scrollIntoView({behavior: 'smooth'})" style="cursor: pointer;" title="點擊直接查看全台 36 種蛙類收錄打勾清單">
        <div class="progress-bar-labels">
          <span class="progress-label-left">🌱 台灣原生蛙類知識庫收錄進度</span>
          <span class="progress-label-right"><strong>7 / 36 種</strong> (約 19%) · 點擊查看 36 種打勾清單 ↓</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: 19%;">
            <span class="progress-frog-walker" title="小青蛙正在跳躍收錄中！">🐸</span>
          </div>
        </div>
      </div>

      <div class="live-stats-row">
        <div class="stat-pill"><span class="pill-dot">🟢</span> 已收錄打勾 <strong>7 種</strong></div>
        <div class="stat-pill" onclick="document.getElementById('checklist36Section')?.scrollIntoView({behavior: 'smooth'})" style="cursor: pointer;" title="點擊瀏覽全台 36 種名冊"><span class="pill-dot">📋</span> 全台蛙類名冊 <strong>36 種</strong></div>
        <div class="stat-pill"><span class="pill-dot">📚</span> 引用典藏來源 <strong>25 份</strong></div>
        <div class="stat-pill"><span class="pill-dot">⏳</span> 籌備收錄物種 <strong>2 種</strong></div>
      </div>

      <div class="live-ticker-bar">
        <span class="ticker-tag">📢 連載速報</span>
        <span class="ticker-text">莫氏樹蛙（No.07）特有種正式收錄！確認一般類 (IUCN LC)、橘紅虹彩、大腿內側鮮紅黑斑（紅內褲）、火雞叫聲與低海拔至2500m高山廣布，全站已累計收錄 7 種蛙類！</span>
      </div>
    </div>
  `;
}

// --- 4. 蛙類卡牌羅列渲染 (包含即將推出的籌備中卡牌) ---

function renderFrogCardsHtml(speciesList) {
  const cardsHtml = speciesList.map((sp, idx) => {
    const isTreeFrog = sp.tags.includes('樹蛙') || sp.family.includes('樹蛙');
    const isRanid = sp.tags.includes('赤蛙') || sp.family.includes('赤蛙');
    const isDicroglossid = sp.tags.includes('叉舌蛙') || sp.family.includes('叉舌蛙') || sp.family.includes('陸蛙');
    const isEndemic = sp.tags.includes('特有種') || sp.summary.includes('特有種');
    const isProtected = sp.tags.includes('保育類') || (sp.stats['保育等級'] && sp.stats['保育等級'].includes('保育'));

    const familyLabel = isTreeFrog ? '樹蛙科' : (isRanid ? '赤蛙科' : (isDicroglossid ? '叉舌蛙科' : (sp.family !== '待查證' ? sp.family : '蛙類')));
    const familyClass = isTreeFrog ? 'tag-treefrog' : (isRanid ? 'tag-ranid' : (isDicroglossid ? 'tag-dicroglossid' : 'tag-general'));

    const rotations = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9];
    const rot = rotations[idx % rotations.length];

    let habitatShort = sp.stats['分布與棲地'];
    if (habitatShort.length > 28) {
      habitatShort = habitatShort.slice(0, 26) + '…';
    }

    return `
      <article class="frog-card" data-family="${familyLabel}" data-endemic="${isEndemic}" data-protected="${isProtected}" onclick="location.hash='${encodeURIComponent(sp.id)}'">
        <div class="card-washi-tape" style="transform: translateX(-50%) rotate(${rot}deg);"></div>
        
        <div class="card-top-bar">
          <div class="card-badges">
            <span class="sticker-badge ${familyClass}">${familyLabel}</span>
            ${isEndemic ? '<span class="sticker-badge tag-endemic">⭐ 台灣特有種</span>' : ''}
            ${isProtected ? '<span class="sticker-badge tag-protect">🌿 保育類</span>' : ''}
          </div>
          <span class="card-stamp-num">No.0${idx + 1}</span>
        </div>

        <div class="card-avatar-wrap">
          <div class="avatar-nature-ring ${sp.image ? 'has-real-photo' : ''}">
            ${sp.image ? `
              <img src="${sp.image}" alt="${sp.title}成蛙生態照" class="avatar-photo-img" />
              <div class="avatar-mini-badge" title="${sp.title}">${getFrogAvatarSvg(sp.title)}</div>
            ` : getFrogAvatarSvg(sp.title)}
          </div>
        </div>

        <div class="card-content">
          <h3 class="card-frog-name">
            <a href="#${encodeURIComponent(sp.id)}" onclick="event.stopPropagation();">${sp.title}</a>
          </h3>
          <div class="card-scientific-name">${sp.scientificName}</div>
          <p class="card-summary">${sp.summary || '點擊進入手帳查看完整外觀特徵與生態觀察筆記。'}</p>

          <div class="card-traits-grid">
            <div class="trait-capsule" title="體長規格">
              <span class="trait-icon">📏</span>
              <span class="trait-text"><strong>體長:</strong> ${sp.stats['體長']}</span>
            </div>
            <div class="trait-capsule" title="活動與繁殖季節">
              <span class="trait-icon">🗓️</span>
              <span class="trait-text"><strong>季節:</strong> ${sp.stats['活動季節']}</span>
            </div>
            <div class="trait-capsule" title="棲息環境">
              <span class="trait-icon">📍</span>
              <span class="trait-text"><strong>棲地:</strong> ${habitatShort}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <a class="card-action-btn" href="#${encodeURIComponent(sp.id)}">
            <span class="btn-frog-icon">🐸</span>
            <span>翻開手帳詳細介紹</span>
            <span class="btn-arrow">→</span>
          </a>
        </div>
      </article>
    `;
  }).join('');

  // 顯著的「籌備調查中物種卡牌」——讓使用者一眼看出卡牌資料庫正在持續擴充更新
  const upcomingCardsHtml = `
    <article class="frog-card card-upcoming" onclick="document.getElementById('liveNotesSection')?.scrollIntoView({behavior: 'smooth'})">
      <div class="card-washi-tape tape-upcoming"></div>
      
      <div class="card-top-bar">
        <div class="card-badges">
          <span class="sticker-badge tag-upcoming">⏳ 調查籌備中</span>
          <span class="sticker-badge tag-endemic">⭐ 台灣特有種</span>
        </div>
        <span class="card-stamp-num">NEXT</span>
      </div>

      <div class="card-avatar-wrap">
        <div class="avatar-nature-ring avatar-upcoming-ring">
          <span class="avatar-upcoming-frog">🐸</span>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-frog-name">面天樹蛙</h3>
        <div class="card-scientific-name">Kurixalus idiootocus · 規劃收錄</div>
        <p class="card-summary">體型嬌小，兩眼間有深色三角形斑，叫聲如短促哨音「嗶、嗶、嗶」。即將收錄。</p>

        <div class="upcoming-status-box">
          <div class="upcoming-step"><span>📄</span> 棲地與叫聲特徵文獻收集</div>
          <div class="upcoming-step"><span>💡</span> 預計新增至「蛙類辨識方法」</div>
        </div>
      </div>

      <div class="card-footer">
        <div class="card-action-btn btn-upcoming">
          <span>查看持續更新清單</span>
          <span class="btn-arrow">↓</span>
        </div>
      </div>
    </article>

    <article class="frog-card card-upcoming" onclick="document.getElementById('liveNotesSection')?.scrollIntoView({behavior: 'smooth'})">
      <div class="card-washi-tape tape-upcoming"></div>
      
      <div class="card-top-bar">
        <div class="card-badges">
          <span class="sticker-badge tag-upcoming">⏳ 調查籌備中</span>
          <span class="sticker-badge tag-general">蟾蜍科</span>
        </div>
        <span class="card-stamp-num">NEXT</span>
      </div>

      <div class="card-avatar-wrap">
        <div class="avatar-nature-ring avatar-upcoming-ring">
          <span class="avatar-upcoming-frog">🐸</span>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-frog-name">黑眶蟾蜍</h3>
        <div class="card-scientific-name">Duttaphrynus melanostictus · 資料收集中</div>
        <p class="card-summary">平地與田野最常見蟾蜍，具黑色眼眶與黑指甲，頭頂骨質脊棱與耳後腺。即將透過 raw/ 匯入建檔。</p>

        <div class="upcoming-status-box">
          <div class="upcoming-step"><span>📄</span> raw/ 原始資料整理中</div>
          <div class="upcoming-step"><span>🔍</span> 正在查驗生活史與鳴叫特性</div>
        </div>
      </div>

      <div class="card-footer">
        <div class="card-action-btn btn-upcoming">
          <span>查看持續更新清單</span>
          <span class="btn-arrow">↓</span>
        </div>
      </div>
    </article>
  `;

  return `
    <section class="frog-cards-section">
      <div class="cards-section-header">
        <div class="section-title-wrap">
          <span class="section-stamp">FIELD COLLECTION · 蛙類卡牌手帳</span>
          <h2 class="section-heading">🐸 台灣蛙類觀察手帳卡牌</h2>
          <p class="section-desc">已收錄 7 種常見與特有蛙類，下方亦列出目前正在調查籌備中的物種卡牌，點擊任一卡牌翻閱詳情。</p>
        </div>
        
        <div class="cards-filter-bar">
          <button class="filter-pill active" data-filter="all">全部展示 (${speciesList.length + 2})</button>
          <button class="filter-pill" data-filter="樹蛙科">🍃 樹蛙科</button>
          <button class="filter-pill" data-filter="赤蛙科">💧 赤蛙科</button>
          <button class="filter-pill" data-filter="叉舌蛙科">🌾 叉舌蛙科</button>
          <button class="filter-pill" data-filter="endemic">⭐ 特有種</button>
          <button class="filter-pill" data-filter="protected">🌿 保育類</button>
        </div>
      </div>

      <div class="frog-cards-grid" id="frogCardsGrid">
        ${cardsHtml}
        ${upcomingCardsHtml}
      </div>
    </section>
  `;
}

function setupCardFilters() {
  const filterBtns = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.frog-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (card.classList.contains('card-upcoming')) {
          // 籌備卡片在特定篩選時顯示
          if (filter === 'all' || filter === 'endemic' || filter === '樹蛙科') {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
          return;
        }

        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === 'endemic') {
          card.style.display = card.getAttribute('data-endemic') === 'true' ? 'flex' : 'none';
        } else if (filter === 'protected') {
          card.style.display = card.getAttribute('data-protected') === 'true' ? 'flex' : 'none';
        } else {
          card.style.display = card.getAttribute('data-family') === filter ? 'flex' : 'none';
        }
      });
    });
  });
}

// --- 5. 持續更新中的觀察筆記格 (Live Field Scratchpad & Activity Notepad) ---

function renderLiveNotebookBox() {
  return `
    <section class="live-notebook-section" id="liveNotesSection">
      <div class="live-notebook-tape">
        <span>ACTIVE LOG · 持續更新中</span>
      </div>
      
      <div class="live-notebook-header">
        <div class="live-header-title">
          <div class="live-kicker-row">
            <span class="live-status-dot"></span>
            <span class="live-kicker">LIVE FIELD NOTEBOOK · 連載手記</span>
            <span class="live-badge-glow">即時更新進行中</span>
          </div>
          <h2 class="live-title">📝 持續更新中的觀察筆記格</h2>
        </div>
        <div class="live-stamp-tag">
          <span class="live-stamp-text">FIELD NOTES<br>● ACTIVE ●</span>
        </div>
      </div>

      <div class="live-notebook-body">
        <div class="notepad-tracks-bar">
          <span class="track-hint">🌱 本格由 AI 與人類協同持續維護中，動態與清單過長時可直接上下滾動瀏覽</span>
          <span class="track-feet">🐾 🐾 🐾 🐸</span>
        </div>

        <div class="live-tabs-nav">
          <button class="live-tab-btn active" data-tab="tab-updates">
            <span class="tab-indicator-dot"></span>
            <span>🌿 知識庫最新手帳動態</span>
          </button>
          <button class="live-tab-btn" data-tab="tab-tasks">
            <span class="tab-indicator-dot"></span>
            <span>🔍 進行中待查與補齊筆記 (0項)</span>
          </button>
          <button class="live-tab-btn" data-tab="tab-all36">
            <span class="tab-indicator-dot"></span>
            <span>📋 全台 36 種打勾清單 (6/36)</span>
            <span class="live-tab-pill">進度 17%</span>
          </button>
          <button class="live-tab-btn" data-tab="tab-scratchpad">
            <span class="tab-indicator-dot"></span>
            <span>✍️ 我的隨手觀察記</span>
            <span class="live-tab-pill">即時手寫</span>
          </button>
        </div>

        <!-- 分頁 1：最新動態 -->
        <div class="live-tab-pane active" id="tab-updates">
          <div class="live-timeline-list">
            <div class="timeline-item item-latest">
              <span class="timeline-dot">🟢</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  <span class="meta-tag tag-new">TODAY 最新</span>
                  2026-11-12 · 莫氏樹蛙 (No.07) 正式收錄與聲學數據更新 (25 份來源)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏（Froghome）、青蛙學堂與經濟部水利署臺北水源特定區環境教育學習中心，正式收錄第 7 種特有種樹蛙「<strong>莫氏樹蛙</strong>」（<em>Zhangixalus moltrechti</em>），確認張氏樹蛙屬、法定保育等級為一般類野生動物（2008 年由保育類調降，IUCN LC）；收錄體長 4–6 cm、橘紅虹彩、大腿內側鮮紅底色與醒目黑斑（「穿紅內褲的青蛙」嚇敵保護色）、體側老人斑、火雞叫聲「呱-阿呱呱呱呱」以及 1.902 秒鳴叫間隔與 1520 Hz 主頻聲學數據。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🟢</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 澤蛙正名、叉舌蛙科分類與生活史全面更新 (22 份來源 · 首波 6 種全數核實完備！)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏 (Froghome)、青蛙學堂、青蛙小站與台灣環境資訊協會 (TEIA)，將澤蛙自早期暫稱「澤樹蛙」正式正名為「澤蛙」（<em>Fejervarya limnocharis</em>），分類歸屬為叉舌蛙科陸蛙屬（無吸盤、半蹼適應陸地泥水），法定保育等級核實為一般類非保育野生動物（IUCN LC）；收錄體長 4–6 cm、上下唇 3–4 條深色唇斑（紋面青蛙）、兩眼中間 V 斑、肩胛 W 斑、棒狀分散膚褶與背中線多態型（寬淡黃線、細線或無線）；確認繁殖期為 3–10 月、產 700–1600 粒浮膜狀卵塊、成蛙單日捕食多達 270 隻昆蟲之農田益蟲角色，以及 0.026 秒超短間隔「嘓嘓-」連續較勁對唱聲學數據。至此首波收錄之 6 種蛙類已 100% 查核完備！
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 斯文豪氏赤蛙臭蛙屬新分類與生態資料全面更新 (18 份來源)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏 (Froghome)、青蛙學堂與教育部教育雲（中研院臺灣生命大百科），確認斯文豪氏赤蛙新分類為赤蛙科臭蛙屬（<em>Odorrana swinhoana</em>），種名紀念「台灣自然史研究第一人」史溫侯（Robert Swinhoe），核實法定等級為一般類非保育野生動物（IUCN LC）；收錄體長 6–10 cm、多變擬態背色、兼具發達吸盤與全蹼、鳥鳴單音「啾」（騙人鳥/鳥蛙）、一對外鳴囊、一隻帶頭跟進較勁合唱、每次產 40–50 顆大型白卵（徑 0.3 cm）、綠豆芽期胚胎與腹側吸盤黑長尾蝌蚪，以及 0.154 秒爆發性鳥鳴聲學物理數據。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 褐樹蛙溪樹蛙屬新分類與生態資料全面更新 (15 份來源)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏 (Froghome) 與楊懿如的青蛙學堂，確認褐樹蛙新分類為樹蛙科溪樹蛙屬（<em>Buergeria robusta</em>），法定保育等級曾為保育類、於 2008 年因族群量穩定降為一般類（IUCN LC）；完整收錄體長（雄 4–5 cm、雌 6–7 cm，整體 5–9 cm）、吻部與背部雙對稱三角斑、T 字形銀白與褐色雙色虹膜、上下唇黑白橫紋（與白頷樹蛙鑑別）、白天淺灰白至繁殖期金黃體色變化、雌蛙交互踢腿產卵行為，以及高達 6690 Hz 的溪流適應性高頻聲學數據。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 台北樹蛙法定保育等級與本土首度命名歷史更新 (13 份來源)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏 (Froghome) 與臺北市生物多樣性資料庫，核實台北樹蛙法定保育等級為「農委會/農業部保育類第 III 級其他應予保育野生動物」(IUCN NT 近危)；確認體長約 4–6 cm、虹膜金黃色、梁潤生與王慶讓教授於 1978 年發表為台灣第一種由本土學者發現命名的蛙種里程碑，以及泥洞鳴叫、弱勢雄蛙替代交配策略與聲學物理數據。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 拉都希氏赤蛙正名與生態資料全面更新 (11 份來源)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏 (Froghome)、台灣環境資訊協會 (TEIA) 與教育雲教育百科，更正官方標準名為「拉都希氏赤蛙」（闊褶蛙），確認赤蛙科 (<em>Hylarana latouchii</em>)、上唇白色與白色頷腺、雄蛙粗壯前肢、集體相親大會抱接生態、每次產 350–450 粒黏性卵與聲學數據，並核實為一般類非保育野生動物 (IUCN LC)。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 諸羅樹蛙法定保育等級核實 (第 II 級珍貴稀有)
                </div>
                <div class="timeline-text">
                  依據台灣兩棲類數位典藏（Froghome，東華大學、林務局、中研院合作），正式核實諸羅樹蛙法定保育等級為「農委會/農業部保育類第 II 級珍貴稀有野生動物」，國際指標為「IUCN EN (瀕危)」，並補充量化聲學物理數據。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 諸羅樹蛙官方保育與教育雲典藏更新 (筆記下方標註來源)
                </div>
                <div class="timeline-text">
                  依據林業及自然保育署嘉義分署與教育雲教育百科（科博館、中研院臺灣生命大百科），完整收錄新學名分類（張樹蛙屬 <em>Zhangixalus arvalis</em>）、雲嘉南 10 個行政區詳細分布、全台約 2 萬隻現存量、400 顆泡沫卵泡、金色魚叉紋蝌蚪與 28 天變態發育、竹林棲地縮減與斑腿樹蛙/亞洲錦蛙入侵威脅，並在各章節下方與文末完整標註資料來源出處。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">
                  2026-11-11 · 手帳連載看板與專屬青蛙圖徽升級
                </div>
                <div class="timeline-text">
                  加入知識庫連載進度看板（當前收錄 6/36 種蛙類）、6 種蛙類專屬外貌生態圖徽、手帳探頭蛙與這格持續更新筆記格，並預告莫氏樹蛙與面天樹蛙。
                </div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">🍃</span>
              <div class="timeline-content">
                <div class="timeline-meta">2026-11-09 · 首波 6 種蛙類手帳卡牌化</div>
                <div class="timeline-text">建立台北樹蛙、諸羅樹蛙、褐樹蛙、斯文豪氏赤蛙、拉都希氏赤蛙、澤樹蛙 6 種獨立手帳頁與卡牌羅列系統。</div>
              </div>
            </div>
            <div class="timeline-item">
              <span class="timeline-dot">📑</span>
              <div class="timeline-content">
                <div class="timeline-meta">2026-11-09 · 辨識與繁殖專題手記</div>
                <div class="timeline-text">完成「蛙類辨識方法」與「各物種繁殖季節對照」兩大專題手記。</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分頁 2：進行中待查與下一階段清單 -->
        <div class="live-tab-pane" id="tab-tasks">
          <div class="live-checklist">
            <div class="checklist-category">🔄 調查中項目 (In-Progress · 首波 6 種全數核實完備)</div>
            <div class="check-empty-hint" style="font-size: 0.88rem; color: #3c6142; background: #eef6f0; border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 0.65rem; border: 1px dashed #a5cfab;">
              🎉 <strong>第一階段 6 種蛙類全面核實結案</strong>：台北樹蛙、諸羅樹蛙、拉都希氏赤蛙、褐樹蛙、斯文豪氏赤蛙、澤蛙之分類學名、法定保育等級、繁殖期生活史與量化聲學數據已全數查驗完備！
            </div>

            <div class="checklist-category" style="margin-top: 0.6rem;">⏳ 下一階段預計收錄物種 (Upcoming)</div>
            <label class="check-item upcoming">
              <span class="check-badge badge-prep">籌備中</span>
              <span class="check-label"><strong>莫氏樹蛙</strong>：虹彩與大腿內側鮮紅特徵、中高海拔廣泛分布。</span>
            </label>
            <label class="check-item upcoming">
              <span class="check-badge badge-prep">籌備中</span>
              <span class="check-label"><strong>面天樹蛙</strong>：小型樹蛙、鳥鳴短哨音、兩眼三角斑。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">1. 諸羅樹蛙：張樹蛙屬新分類、法定保育等級核實（農委會/農業部第 II 級珍貴稀有、IUCN EN 瀕危）、金色魚叉蝌蚪與聲學數據。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">2. 台北樹蛙：張樹蛙屬新分類、法定保育等級核實（第 III 級其他應予保育、IUCN NT 近危）、梁潤生與王慶讓教授本土首度發表歷史與泥洞泡沫卵塊生態。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">3. 褐樹蛙：溪樹蛙屬新分類、一般類 (IUCN LC) 核實、雙對稱三角斑、T字雙色虹膜與 6690 Hz 溪流高頻聲學數據。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">4. 斯文豪氏赤蛙：臭蛙屬新分類、史溫侯紀念命名歷史、一般類 (IUCN LC) 核實、鳥鳴「啾」0.154 秒聲學數據與生活史收錄。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">5. 拉都希氏赤蛙：官方標準名更正、赤蛙科分類、一般類非保育類 (IUCN LC) 核實、粗厚背側褶與相親大會抱接生態。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">6. 澤蛙：原暫稱澤樹蛙正式更正正名、叉舌蛙科陸蛙屬新分類、一般類 (IUCN LC) 核實、紋面縱斑、3–10月浮膜卵與 0.026 秒「嘓嘓-」對唱聲學數據。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">7. 莫氏樹蛙：張樹蛙屬新分類、特有種、2008年降為一般類 (IUCN LC) 核實、橘紅虹彩、大腿內側黑斑與鮮紅底色（紅內褲）、火雞叫聲與全島至2500m廣布。</span>
            </label>
            <label class="check-item done">
              <span class="check-badge badge-done">已完成</span>
              <span class="check-label">已累計收錄 7 種核心蛙類（特有種達 6 種），生態照片與生活史完備。</span>
            </label>
          </div>
        </div>

        <!-- 分頁 3：全台 36 種蛙類收錄打勾表 -->
        <div class="live-tab-pane" id="tab-all36">
          <div class="live-checklist">
            <div class="checklist-category">📋 全台 36 種蛙類名錄與收錄進度（已收錄 7 種 / 待收錄 29 種）</div>
            <div class="check-empty-hint" style="font-size: 0.88rem; color: #2d6b3a; background: #eef7f0; border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 0.65rem; border: 1px dashed #9cc5a1;">
              💡 <strong>點擊已打勾的物種</strong> 可直接翻閱獨立觀察手帳；亦可下滑至網頁中段瀏覽圖文卡牌版打勾清單。
            </div>
            ${renderTab36ChecklistHtml()}
          </div>
        </div>

        <!-- 分頁 4：即時隨手筆記格 -->
        <div class="live-tab-pane" id="tab-scratchpad">
          <div class="scratchpad-box">
            <div class="scratchpad-tip">
              <span>💡</span> <strong>野外隨手便籤</strong>：在此隨手記錄聽到的蛙鳴、拍攝地點或問題，內容會即時自動保存在這台裝置的手帳中：
            </div>
            <textarea id="fieldScratchpadText" class="scratchpad-textarea" placeholder="例如：
[2026-11-11] 於嘉義竹林聽見清脆高亮鳴叫聲，疑似諸羅樹蛙雨後求偶！
待確認：腹部是否有黑斑？體側白線是否明顯？"></textarea>
            <div class="scratchpad-footer">
              <span class="scratchpad-status" id="scratchpadStatus">✓ 隨手筆記已就緒 (自動儲存)</span>
              <div class="scratchpad-actions">
                <button class="notepad-btn btn-time" id="btnInsertTime">⏱️ 插入時間戳</button>
                <button class="notepad-btn btn-clear" id="btnClearNotes">🗑️ 清空筆記</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function setupLiveScratchpad() {
  const tabBtns = document.querySelectorAll('.live-tab-btn');
  const tabPanes = document.querySelectorAll('.live-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  const textarea = document.getElementById('fieldScratchpadText');
  const status = document.getElementById('scratchpadStatus');
  const btnTime = document.getElementById('btnInsertTime');
  const btnClear = document.getElementById('btnClearNotes');

  if (textarea) {
    const saved = localStorage.getItem('frog_wiki_live_notes');
    if (saved) textarea.value = saved;

    let timeout;
    textarea.addEventListener('input', () => {
      if (status) status.textContent = '✏️ 儲存中…';
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem('frog_wiki_live_notes', textarea.value);
        if (status) status.textContent = '✓ 已自動儲存至本機手帳';
      }, 350);
    });

    if (btnTime) {
      btnTime.addEventListener('click', () => {
        const now = new Date();
        const stamp = `\n[${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}] `;
        textarea.value = (textarea.value + stamp).trimStart();
        localStorage.setItem('frog_wiki_live_notes', textarea.value);
        textarea.focus();
        if (status) status.textContent = '✓ 時間戳已插入';
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('確定要清空隨手觀察筆記嗎？')) {
          textarea.value = '';
          localStorage.removeItem('frog_wiki_live_notes');
          if (status) status.textContent = '✓ 筆記已清空';
        }
      });
    }
  }
}

// --- 5.1 台灣 36 種蛙類全名錄與打勾清單 ---
const TAIWAN_36_FROGS = [
  // 樹蛙科 (14)
  { name: '諸羅樹蛙', scientific: 'Zhangixalus arvalis', family: '樹蛙科', orderNum: 'No.01', uploaded: true, pageId: 'species/諸羅樹蛙', endemic: true, protect: '保育類 II 級', protectType: 'protected', desc: '平地竹林雨怪、體側白線、金色魚叉紋蝌蚪' },
  { name: '台北樹蛙', scientific: 'Zhangixalus taipeianus', family: '樹蛙科', orderNum: 'No.02', uploaded: true, pageId: 'species/台北樹蛙', endemic: true, protect: '保育類 III 級', protectType: 'protected', desc: '本土首度命名發表、冬季泥洞繁殖、虹膜金黃' },
  { name: '褐樹蛙', scientific: 'Buergeria robusta', family: '樹蛙科', orderNum: 'No.03', uploaded: true, pageId: 'species/褐樹蛙', endemic: true, protect: '一般類', protectType: 'general', desc: '溪樹蛙屬、T字雙色虹膜、雙三角斑、6690 Hz 高頻鳴叫' },
  { name: '莫氏樹蛙', scientific: 'Zhangixalus moltrechti', family: '樹蛙科', orderNum: 'No.07', uploaded: true, pageId: 'species/莫氏樹蛙', endemic: true, protect: '一般類', protectType: 'general', desc: '虹彩橘紅、大腿內側黑斑與鮮紅底色（紅內褲）、廣布中高海拔至2500m' },
  { name: '面天樹蛙', scientific: 'Kurixalus idiootocus', family: '樹蛙科', orderNum: null, uploaded: false, upcoming: true, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '體型嬌小、兩眼間深色三角斑、短促如鳥哨音' },
  { name: '翡翠樹蛙', scientific: 'Zhangixalus prasinatus', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '保育類 II 級', protectType: 'protected', desc: '背部翠綠帶金黃眼鼻線、產白色泡沫卵、翡翠水庫代表種' },
  { name: '橙腹樹蛙', scientific: 'Zhangixalus aurantiventris', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '保育類 II 級', protectType: 'protected', desc: '腹部純橘紅無斑點、原始闊葉林樹冠層生活' },
  { name: '艾氏樹蛙', scientific: 'Kurixalus eiffingeri', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '竹筒樹洞產卵、雌蛙產卵撫育蝌蚪之親代撫育行為' },
  { name: '碧眼樹蛙', scientific: 'Kurixalus berylliniris', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '虹膜如翠綠碧玉、2016年發表特有種、花東縱谷分布' },
  { name: '王氏樹蛙', scientific: 'Kurixalus wangi', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '2016年發表特有種、恆春半島特有低海拔樹蛙' },
  { name: '布氏樹蛙', alias: '白頷樹蛙', scientific: 'Polypedates braueri', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '上唇純白、吸盤小於鼓膜、背部深色條紋、四條線樹蛙' },
  { name: '周氏樹蛙', alias: '日本樹蛙', scientific: 'Buergeria choui', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '耐高溫溪流溫泉蛙、背部具 H 斑、常棲於溫泉邊' },
  { name: '太田樹蛙', scientific: 'Buergeria otai', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '2017年發表特有種、東台灣與南部低海拔、連串如鳥叫聲' },
  { name: '斑腿樹蛙', scientific: 'Polypedates megacephalus', family: '樹蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '外來入侵種', protectType: 'invasive', desc: '強勢入侵排擠白頷樹蛙與諸羅樹蛙，林業署積極防除' },

  // 赤蛙科 (10)
  { name: '斯文豪氏赤蛙', scientific: 'Odorrana swinhoana', family: '赤蛙科', orderNum: 'No.04', uploaded: true, pageId: 'species/斯文豪氏赤蛙', endemic: true, protect: '一般類', protectType: 'general', desc: '臭蛙屬、史溫侯紀念命名、鳥鳴「啾」、發達吸盤與全蹼' },
  { name: '拉都希氏赤蛙', scientific: 'Hylarana latouchii', family: '赤蛙科', orderNum: 'No.05', uploaded: true, pageId: 'species/拉都希氏赤蛙', endemic: false, protect: '一般類', protectType: 'general', desc: '闊褶蛙、白色頷腺、雄蛙粗壯前臂、隨遇而安全年繁殖' },
  { name: '梭德氏赤蛙', scientific: 'Rana sauteri', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '溪流型赤蛙、秋季大遷徙產卵、蝌蚪口腹吸盤' },
  { name: '長腳赤蛙', scientific: 'Rana longicrus', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '後肢極長善跳躍、冬季田間靜水域繁殖' },
  { name: '台北赤蛙', scientific: 'Hylarana taipehensis', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '保育類 II 級', protectType: 'protected', desc: '體型纖細嬌小、背部翠綠具金黃背側褶、草澤濕地棲息' },
  { name: '金線蛙', scientific: 'Pelophylax fukienensis', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '保育類 II 級', protectType: 'protected', desc: '背部深綠具金黃背中線與背側褶、水棲性強' },
  { name: '豎琴蛙', scientific: 'Nidirana okinavana', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '保育類 II 級', protectType: 'protected', desc: '侷限分布於南投埔里草湳濕地、雄蛙會築泥窩求偶' },
  { name: '腹斑蛙', scientific: 'Nidirana adenopleura', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '叫聲宏亮如「給—給—給」、背中線淡色' },
  { name: '貢德氏赤蛙', scientific: 'Sylvirana guentheri', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '大型赤蛙、鼓膜具白邊、叫聲宛如狗吠「苟—」' },
  { name: '美洲牛蛙', scientific: 'Aquarana catesbeiana', family: '赤蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '外來入侵種', protectType: 'invasive', desc: '體型巨大、掠食性極強、排擠吞食本土兩棲類' },

  // 叉舌蛙科 (4)
  { name: '澤蛙', scientific: 'Fejervarya limnocharis', family: '叉舌蛙科', orderNum: 'No.06', uploaded: true, pageId: 'species/澤蛙', endemic: false, protect: '一般類', protectType: 'general', desc: '平地稻田益蟲、紋面縱斑、棒狀膚褶、0.026 秒急速對唱' },
  { name: '虎皮蛙', alias: '虎紋蛙', scientific: 'Hoplobatrachus rugulosus', family: '叉舌蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '保育類 II 級', protectType: 'protected', desc: '台灣原生最大型蛙類、背部具整齊條狀長膚褶' },
  { name: '福建大頭蛙', alias: '古氏赤蛙', scientific: 'Limnonectes fujianensis', family: '叉舌蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '雄蛙頭部大且寬、下顎具偽齒、瞳孔呈菱形' },
  { name: '海蛙', scientific: 'Fejervarya cancrivora', family: '叉舌蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '外來種', protectType: 'introduced', desc: '具極強耐鹽性、生活於台灣南部沿海紅樹林泥灘' },

  // 狹口蛙科 (5)
  { name: '小雨蛙', scientific: 'Microhyla fissipes', family: '狹口蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '體型小如指甲、三角身型、背部對稱塔狀斑' },
  { name: '黑蒙西氏小雨蛙', scientific: 'Microhyla heymonsi', family: '狹口蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '體型僅 2–2.5 cm、背中央有括號黑斑、發報機叫聲' },
  { name: '巴氏小雨蛙', scientific: 'Microhyla butleri', family: '狹口蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '背部具精美對稱波浪紋、嘉南高屏低海拔草澤' },
  { name: '史丹吉氏小雨蛙', scientific: 'Micryletta steinegeri', family: '狹口蛙科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '台灣特有珍稀狹口蛙、背部深褐具灰白細斑' },
  { name: '亞洲錦蛙', alias: '花狹口蛙', scientific: 'Kaloula pulchra', family: '狹口蛙科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '外來入侵種', protectType: 'invasive', desc: '受驚擾身體鼓脹如球、具黏稠毒液、高雄屏東入侵擴散' },

  // 蟾蜍科 (2)
  { name: '盤古蟾蜍', scientific: 'Bufo bankorensis', family: '蟾蜍科', orderNum: null, uploaded: false, pageId: null, endemic: true, protect: '一般類', protectType: 'general', desc: '台灣最廣布大型原生蟾蜍、全台山區常見、無黑眼線' },
  { name: '黑眶蟾蜍', scientific: 'Duttaphrynus melanostictus', family: '蟾蜍科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '眼周具黑眶骨質脊、指尖黑似塗指甲油、平地田野常見' },

  // 樹蟾科 (1)
  { name: '中國樹蟾', scientific: 'Hyla chinensis', family: '樹蟾科', orderNum: null, uploaded: false, pageId: null, endemic: false, protect: '一般類', protectType: 'general', desc: '鮮豔草綠色、眼鼻黑色眼罩、趾端吸盤但骨骼屬蟾蜍類群' }
];

function renderTab36ChecklistHtml() {
  const families = ['樹蛙科', '赤蛙科', '叉舌蛙科', '狹口蛙科', '蟾蜍科', '樹蟾科'];
  return families.map(fam => {
    const list = TAIWAN_36_FROGS.filter(f => f.family === fam);
    const uploadedInFam = list.filter(f => f.uploaded).length;
    return `
      <div class="checklist-category" style="margin-top: 0.6rem;">
        ${fam} (${uploadedInFam} / ${list.length} 已收錄)
      </div>
      ${list.map(f => {
        if (f.uploaded) {
          return `
            <label class="check-item done" onclick="location.hash='${encodeURIComponent(f.pageId)}'" style="cursor: pointer;" title="點擊翻閱手帳">
              <span class="check-badge badge-done">✓ ${f.orderNum}</span>
              <span class="check-label">
                <strong><a href="#${encodeURIComponent(f.pageId)}" onclick="event.stopPropagation();">${f.name}</a></strong>
                （${f.scientific}）${f.endemic ? ' · ⭐特有種' : ''}${f.protect.includes('保育') ? ' · 🌿' + f.protect : ''} — ${f.desc}
              </span>
            </label>
          `;
        } else if (f.upcoming) {
          return `
            <label class="check-item upcoming">
              <span class="check-badge badge-prep">⏳ 籌備中</span>
              <span class="check-label">
                <strong>${f.name}</strong>（${f.scientific}）${f.endemic ? ' · ⭐特有種' : ''} — ${f.desc}
              </span>
            </label>
          `;
        } else {
          return `
            <label class="check-item pending">
              <span class="check-badge" style="background: #ede8dc; color: #73644d;">⬜ 待收錄</span>
              <span class="check-label" style="opacity: 0.85;">
                <strong>${f.name}</strong>（${f.scientific}）${f.endemic ? ' · ⭐特有種' : ''}${f.protect.includes('保育') ? ' · 🌿' + f.protect : ''}${f.protect.includes('外來') ? ' · ⚠️' + f.protect : ''} — ${f.desc}
              </span>
            </label>
          `;
        }
      }).join('')}
    `;
  }).join('');
}

function renderAll36ChecklistSection() {
  const uploadedCount = TAIWAN_36_FROGS.filter(f => f.uploaded).length;
  const endemicCount = TAIWAN_36_FROGS.filter(f => f.endemic).length;
  const protectedCount = TAIWAN_36_FROGS.filter(f => f.protect.includes('保育')).length;

  const cardsHtml = TAIWAN_36_FROGS.map((f) => {
    const isUploaded = f.uploaded;
    const isUpcoming = f.upcoming;
    const isProtected = f.protect.includes('保育');
    const isInvasive = f.protect.includes('外來');

    const cardClass = isUploaded ? 'is-uploaded' : (isUpcoming ? 'is-upcoming' : (isInvasive ? 'is-invasive' : ''));
    const boxIcon = isUploaded ? '✓' : (isUpcoming ? '⏳' : '⬜');
    const statusLabel = isUploaded ? '✅ 已收錄建檔' : (isUpcoming ? '⏳ 籌備調查中' : '⬜ 待收錄');
    const statusClass = isUploaded ? 'bg-uploaded' : (isUpcoming ? 'bg-upcoming' : 'bg-pending');

    return `
      <div class="chk-item-card ${cardClass}" 
           data-uploaded="${isUploaded}" 
           data-family="${f.family}" 
           data-endemic="${f.endemic}" 
           data-protected="${isProtected}"
           ${isUploaded ? `onclick="location.hash='${encodeURIComponent(f.pageId)}'"` : ''}
           style="${isUploaded ? 'cursor: pointer;' : ''}">
        <div class="chk-box-indicator" title="${statusLabel}">
          <span>${boxIcon}</span>
        </div>
        <div class="chk-item-body">
          <div class="chk-item-head">
            <h4 class="chk-item-name">
              ${isUploaded ? `<a href="#${encodeURIComponent(f.pageId)}" onclick="event.stopPropagation();">${f.name}</a>` : f.name}
            </h4>
            ${f.orderNum ? `<span class="chk-order-stamp">${f.orderNum}</span>` : ''}
          </div>
          <div class="chk-scientific-text">${f.scientific}</div>
          <div class="chk-badges-row">
            <span class="chk-badge ${statusClass}">${statusLabel}</span>
            <span class="chk-badge bg-family">${f.family}</span>
            ${f.endemic ? '<span class="chk-badge bg-endemic">⭐ 特有種</span>' : ''}
            ${isProtected ? `<span class="chk-badge bg-protect">🌿 ${f.protect}</span>` : ''}
            ${isInvasive ? `<span class="chk-badge bg-invasive">⚠️ ${f.protect}</span>` : ''}
          </div>
          <p class="chk-desc-text">${f.desc}</p>
          ${isUploaded ? `
            <a class="chk-action-link" href="#${encodeURIComponent(f.pageId)}" onclick="event.stopPropagation();">
              <span>翻閱觀察手帳</span>
              <span>→</span>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="all-36-checklist-section" id="checklist36Section">
      <div class="checklist-tape-top">CHECKLIST · 36 SPECIES</div>

      <div class="checklist-section-header">
        <div class="checklist-kicker-row">
          <span class="checklist-stamp-badge">FIELD CHECKLIST · 台灣蛙類觀察名冊</span>
          <span class="live-status-dot"></span>
        </div>
        <h2 class="checklist-main-title">📋 全台 36 種蛙類收錄打勾清單</h2>
        <p class="checklist-lead-desc">
          依據《台灣蛙類與蝌蚪圖鑑》與「台灣兩棲類動物保育網」權威名錄整理。知識庫目前已完成收錄並核實 <strong>6 種</strong>（已打勾，點擊可直接翻閱獨立觀察手帳），其餘 <strong>30 種</strong>依照計畫持續推進擴充中。
        </p>

        <div class="checklist-stats-bar">
          <div class="chk-stat-pill">🌱 總計：<strong>36 種</strong></div>
          <div class="chk-stat-pill">✅ 已收錄打勾：<strong>${uploadedCount} 種</strong> (16.7%)</div>
          <div class="chk-stat-pill">⭐ 台灣特有種：<strong>${endemicCount} 種</strong></div>
          <div class="chk-stat-pill">🌿 法定保育類：<strong>${protectedCount} 種</strong></div>
          <div class="chk-stat-pill">⬜ 待收錄擴充：<strong>${36 - uploadedCount} 種</strong></div>
        </div>

        <div class="checklist-filters-wrap">
          <button class="chk-filter-btn active" data-chk-filter="all">全部 (36)</button>
          <button class="chk-filter-btn" data-chk-filter="uploaded">✅ 已收錄打勾 (${uploadedCount})</button>
          <button class="chk-filter-btn" data-chk-filter="pending">⬜ 待收錄 (${36 - uploadedCount})</button>
          <button class="chk-filter-btn" data-chk-filter="endemic">⭐ 台灣特有種 (${endemicCount})</button>
          <button class="chk-filter-btn" data-chk-filter="protected">🌿 保育類 (${protectedCount})</button>
          <button class="chk-filter-btn" data-chk-filter="樹蛙科">🍃 樹蛙科 (14)</button>
          <button class="chk-filter-btn" data-chk-filter="赤蛙科">💧 赤蛙科 (10)</button>
          <button class="chk-filter-btn" data-chk-filter="叉舌蛙科">🌾 叉舌蛙科 (4)</button>
          <button class="chk-filter-btn" data-chk-filter="狹口蛙科">🟤 狹口蛙科 (5)</button>
          <button class="chk-filter-btn" data-chk-filter="蟾蜍科">⛰️ 蟾蜍科 (2)</button>
          <button class="chk-filter-btn" data-chk-filter="樹蟾科">🌿 樹蟾科 (1)</button>
        </div>
      </div>

      <div class="checklist-items-grid" id="checklist36Grid">
        ${cardsHtml}
      </div>

      <div class="checklist-footer-nav">
        <span class="chk-footer-hint">💡 點擊已打勾之蛙類卡牌，可直接跳轉翻閱手帳基本資料、外觀辨識與量化聲學數據。</span>
        <a href="#concepts/%E5%8F%B0%E7%81%A336%E7%A8%AE%E8%9B%99%E9%A1%9E%E5%90%8D%E9%8C%84" class="btn-goto-concept">
          <span>📖 查看名錄完整解說專題</span>
          <span>→</span>
        </a>
      </div>
    </section>
  `;
}

function setupAll36ChecklistFilters() {
  const filterBtns = document.querySelectorAll('.chk-filter-btn');
  const cards = document.querySelectorAll('.chk-item-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-chk-filter');
      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === 'uploaded') {
          card.style.display = card.getAttribute('data-uploaded') === 'true' ? 'flex' : 'none';
        } else if (filter === 'pending') {
          card.style.display = card.getAttribute('data-uploaded') === 'false' ? 'flex' : 'none';
        } else if (filter === 'endemic') {
          card.style.display = card.getAttribute('data-endemic') === 'true' ? 'flex' : 'none';
        } else if (filter === 'protected') {
          card.style.display = card.getAttribute('data-protected') === 'true' ? 'flex' : 'none';
        } else {
          card.style.display = card.getAttribute('data-family') === filter ? 'flex' : 'none';
        }
      });
    });
  });
}

// --- 6. 物種獨立手帳頁面渲染 (每種青蛙獨立介紹) ---

function renderSpeciesJournalPage(sp, allSpecies) {
  const currentIndex = allSpecies.findIndex(item => item.id === sp.id);
  const prevSpecies = currentIndex > 0 ? allSpecies[currentIndex - 1] : null;
  const nextSpecies = (currentIndex >= 0 && currentIndex < allSpecies.length - 1) ? allSpecies[currentIndex + 1] : null;

  const tagsHtml = sp.tags.map(tag => {
    let tagClass = 'tag-general';
    if (tag === '特有種') tagClass = 'tag-endemic';
    else if (tag === '保育類') tagClass = 'tag-protect';
    else if (tag.includes('樹蛙')) tagClass = 'tag-treefrog';
    else if (tag.includes('赤蛙')) tagClass = 'tag-ranid';
    return `<span class="journal-sticker ${tagClass}"># ${tag}</span>`;
  }).join(' ');

  const statItems = [
    { label: '學名', val: sp.stats['學名'], icon: '🏷️' },
    { label: '科別', val: sp.stats['科'], icon: '🌿' },
    { label: '體長規格', val: sp.stats['體長'], icon: '📏' },
    { label: '活動季節', val: sp.stats['活動季節'], icon: '📅' },
    { label: '分布與棲地', val: sp.stats['分布與棲地'], icon: '🗺️', wide: true },
    { label: '保育等級', val: sp.stats['保育等級'], icon: '🛡️' }
  ];

  const statGridHtml = statItems.map(item => `
    <div class="spec-stat-card ${item.wide ? 'spec-stat-wide' : ''}">
      <div class="stat-card-header">
        <span class="stat-icon">${item.icon}</span>
        <span class="stat-label">${item.label}</span>
      </div>
      <div class="stat-value">${item.val === '待查證' ? '<span class="value-verify">待查證</span>' : item.val}</div>
    </div>
  `).join('');

  const traitsMd = sp.sections['辨識特徵'] ? marked.parse(wikiLinks(sp.sections['辨識特徵'])) : '<p>尚無詳細外觀記錄。</p>';
  const callMd = sp.sections['鳴叫'] ? marked.parse(wikiLinks(sp.sections['鳴叫'])) : '<p>尚未記錄鳴叫特徵。</p>';
  const lifeMd = sp.sections['繁殖與生活史'] ? marked.parse(wikiLinks(sp.sections['繁殖與生活史'])) : '<p>尚未記錄繁殖資訊。</p>';
  const relatedMd = sp.sections['相關頁面'] ? marked.parse(wikiLinks(sp.sections['相關頁面'])) : '';
  const verifyContent = sp.sections['待查證'] ? marked.parse(wikiLinks(sp.sections['待查證'])) : null;

  return `
    <article class="species-journal-page">
      <div class="journal-washi-tape tape-top-left"></div>
      <div class="journal-washi-tape tape-top-right"></div>

      <nav class="species-top-nav">
        <a class="nav-back-cards" href="#overview">
          <span class="back-icon">❮</span>
          <span>返回蛙類手帳卡牌總覽</span>
        </a>
        <span class="journal-category-stamp">FIELD NOTEBOOK ❯ SPECIES RECORD</span>
      </nav>

      <header class="species-header">
        <div class="species-title-row">
          <div class="species-title-group">
            <h1 class="species-main-title">
              <span class="title-frog-prefix">🐸</span>
              ${sp.title}
            </h1>
            <div class="species-scientific-sub">${sp.scientificName}</div>
          </div>
          <div class="species-species-badge">
            <div class="badge-avatar-circle">
              ${getFrogAvatarSvg(sp.title)}
            </div>
          </div>
        </div>

        <div class="species-tags-bar">
          ${tagsHtml}
          ${sp.meta.updated ? `<span class="journal-date-badge">📅 記錄更新: ${sp.meta.updated}</span>` : ''}
        </div>
      </header>

      <div class="species-intro-callout">
        <div class="callout-leaf-accent">🌿 觀察手記重點</div>
        <p class="intro-paragraph">${sp.summary}</p>
      </div>

      ${sp.image ? `
        <figure class="journal-polaroid-frame">
          <div class="polaroid-pin">📌</div>
          <div class="polaroid-washi-tape"></div>
          <div class="polaroid-img-wrap">
            <img src="${sp.image}" alt="${sp.title}成蛙生態照" class="polaroid-img" />
          </div>
          <figcaption class="polaroid-caption-bar">
            <div class="polaroid-caption-text">🌿 ${sp.imageCaption || (sp.title + '成蛙生態照')}</div>
            <div class="polaroid-source-credit">
              <span class="source-credit-icon">📷</span>
              <span class="source-credit-label"><strong>照片來源：</strong>${sp.imageSource || '未標註'}</span>
              ${sp.imageLicense ? `<span class="source-license-pill">${sp.imageLicense}</span>` : ''}
            </div>
          </figcaption>
        </figure>
      ` : ''}

      <section class="journal-section">
        <h2 class="section-badge-title"><span>📋</span> 基本資料檔案</h2>
        <div class="spec-grid-container">
          ${statGridHtml}
        </div>
      </section>

      <section class="journal-section">
        <h2 class="section-badge-title"><span>🔍</span> 辨識特徵筆記 <span class="scroll-badge-indicator" title="內容較長時可上下滑動滾輪瀏覽">📜 可滑動滾輪</span></h2>
        <div class="journal-traits-box">
          ${traitsMd}
        </div>
      </section>

      <div class="journal-dual-columns">
        <section class="journal-sub-card call-note-card">
          <div class="washi-tape-mini tape-mint"></div>
          <h2 class="section-badge-title"><span>📢</span> 鳴叫觀察札記 <span class="scroll-badge-indicator" title="內容較長時可上下滑動滾輪瀏覽">📜 可滑動</span></h2>
          <div class="note-body">${callMd}</div>
        </section>

        <section class="journal-sub-card life-note-card">
          <div class="washi-tape-mini tape-sage"></div>
          <h2 class="section-badge-title"><span>🥚</span> 繁殖與生活史 <span class="scroll-badge-indicator" title="內容較長時可上下滑動滾輪瀏覽">📜 可滑動</span></h2>
          <div class="note-body">${lifeMd}</div>
        </section>
      </div>

      ${sp.sections['生態習性與生存危機'] ? `
        <section class="journal-section ecology-crisis-section">
          <div class="washi-tape-mini tape-kraft"></div>
          <h2 class="section-badge-title"><span>⚠️</span> 生態習性與生存危機 <span class="scroll-badge-indicator" title="內容較長時可上下滑動滾輪瀏覽">📜 可滑動</span></h2>
          <div class="journal-traits-box ecology-box">
            ${marked.parse(wikiLinks(sp.sections['生態習性與生存危機']))}
          </div>
        </section>
      ` : ''}

      ${sp.sections['資料來源標註'] ? `
        <section class="journal-section sources-citation-section">
          <div class="washi-tape-mini tape-mint"></div>
          <h2 class="section-badge-title"><span>📚</span> 資料來源標註 (Field Sources & Citations) <span class="scroll-badge-indicator" title="內容較長時可上下滑動滾輪瀏覽">📜 可滑動</span></h2>
          <div class="sources-citation-card">
            <div class="sources-card-hint">
              <span>🌱 <strong>資料來源查證原則</strong>：本手帳筆記嚴格依據政府保育單位、國家數位典藏與學術文獻紀錄整理，下方為本頁引用文獻出處（內容過長可滾動查看）：</span>
            </div>
            <div class="sources-citation-body">
              ${marked.parse(wikiLinks(sp.sections['資料來源標註']))}
            </div>
          </div>
        </section>
      ` : ''}

      ${relatedMd ? `
        <section class="journal-section related-section">
          <h2 class="section-badge-title"><span>🔗</span> 相關手帳頁面</h2>
          <div class="related-pills-box">${relatedMd}</div>
        </section>
      ` : ''}

      ${verifyContent ? `
        <div class="journal-sticky-note">
          <div class="sticky-pin">📌</div>
          <div class="sticky-tape"></div>
          <h3 class="sticky-title">待查證與補充事項</h3>
          <div class="sticky-content">${verifyContent}</div>
        </div>
      ` : ''}

      ${getFrogFootprintsHtml()}

      <footer class="species-footer-pager">
        ${prevSpecies ? `
          <a class="pager-btn pager-prev" href="#${encodeURIComponent(prevSpecies.id)}">
            <span class="pager-arrow">←</span>
            <div class="pager-info">
              <span class="pager-hint">上一種蛙類</span>
              <span class="pager-name">${prevSpecies.title}</span>
            </div>
          </a>
        ` : '<div class="pager-placeholder"></div>'}

        <a class="pager-btn-center" href="#overview">
          <span>🗂️ 蛙類卡牌全覽</span>
        </a>

        ${nextSpecies ? `
          <a class="pager-btn pager-next" href="#${encodeURIComponent(nextSpecies.id)}">
            <div class="pager-info" style="text-align: right;">
              <span class="pager-hint">下一種蛙類</span>
              <span class="pager-name">${nextSpecies.title}</span>
            </div>
            <span class="pager-arrow">→</span>
          </a>
        ` : '<div class="pager-placeholder"></div>'}
      </footer>
    </article>
  `;
}

// --- 7. 一般概念頁面與總覽頁面渲染 ---

function formatStickyNotesInHtml(html) {
  html = html.replace(
    /<h2[^>]*>(?:📌\s*)?待查證<\/h2>([\s\S]*?)(?=<h2|$)/gi,
    (match, p1) => `
      <div class="journal-sticky-note">
        <div class="sticky-pin">📌</div>
        <div class="sticky-tape"></div>
        <h3 class="sticky-title">待查證與補充事項 <span class="scroll-badge-indicator" title="內容較長時可上下滑動滾輪瀏覽">📜 可滑動</span></h3>
        <div class="sticky-content">${p1}</div>
      </div>
    `
  );

  // 表格過長時自動包覆進具有滾輪滑動與標頭置頂的容器中
  html = html.replace(/<table[\s\S]*?<\/table>/gi, match => `
    <div class="table-scroll-wrap">
      ${match}
    </div>
  `);

  return html;
}

async function renderOverviewPage(meta, body) {
  const speciesList = await getAllSpeciesList();
  const bannerHtml = renderLiveProgressBanner();
  const liveNotesHtml = renderLiveNotebookBox();
  const cardsHtml = renderFrogCardsHtml(speciesList);
  const checklist36Html = renderAll36ChecklistSection();
  const footprintsHtml = getFrogFootprintsHtml();

  let markdownBody = wikiLinks(body);
  
  // 移除 overview 內 markdown table 與原本文字標題，改由我們的高階手帳卡牌與連載面板呈現
  let cleanedBody = markdownBody
    .replace(/##\s*持續更新手記[\s\S]*?(?=##\s*內文|$)/, '')
    .replace(/<table[\s\S]*?<\/table>/, '');

  let html = marked.parse(cleanedBody);

  // 結構組裝：連載狀態看板 -> 持續更新筆記格 -> 足跡 -> 卡牌網格 -> 36種名錄打勾清單 -> 其餘專題
  html = bannerHtml + liveNotesHtml + footprintsHtml + cardsHtml + checklist36Html + html;
  html = formatStickyNotesInHtml(html);

  content.innerHTML = `
    <div class="overview-journal-wrap">
      <div class="journal-washi-tape tape-top-center"></div>
      ${html}
    </div>
  `;

  setupCardFilters();
  setupAll36ChecklistFilters();
  setupLiveScratchpad();
}

async function renderGeneralPage(meta, body, name) {
  let html = marked.parse(wikiLinks(body));
  html = formatStickyNotesInHtml(html);

  const info = [];
  if (meta.updated) info.push('📝 記錄更新: ' + meta.updated);
  if (meta.sources && Array.isArray(meta.sources) && meta.sources.length) {
    info.push('📚 引用來源: ' + meta.sources.map(s => `<a href="#${encodeURIComponent(s)}">${s.split('/').pop()}</a>`).join(', '));
  }

  content.innerHTML = `
    <article class="general-journal-page">
      <div class="journal-washi-tape tape-top-center"></div>
      ${info.length ? `<div class="journal-meta-bar">${info.join(' ｜ ')}</div>` : ''}
      <div class="journal-markdown-body">${html}</div>
      ${getFrogFootprintsHtml()}
    </article>
  `;
}

// --- 8. 頁面載入與路由 ---

async function loadPage(name) {
  try {
    content.innerHTML = `
      <div class="journal-loading-card">
        <div class="loading-frog-icon">🐸</div>
        <p>正在翻開觀察手帳…</p>
      </div>
    `;

    const rawText = await getText(name);
    const { meta, body } = parseFrontmatter(rawText);

    if (name.startsWith('species/')) {
      const allSpecies = await getAllSpeciesList();
      const currentSpecies = parseSpeciesMarkdown(rawText, name);
      content.innerHTML = renderSpeciesJournalPage(currentSpecies, allSpecies);
      document.title = `${currentSpecies.title} — 台灣蛙類圖鑑手帳`;
    } else if (name === 'overview' || name === 'index') {
      await renderOverviewPage(meta, body);
      document.title = '台灣蛙類手帳卡牌總覽 (連載更新中) — 台灣蛙類圖鑑';
    } else {
      await renderGeneralPage(meta, body, name);
      document.title = `${meta.title || name} — 台灣蛙類圖鑑`;
    }

    updateActiveNav(name);
  } catch (e) {
    console.error(e);
    content.innerHTML = `
      <div class="journal-error-card">
        <div class="sticky-pin">📌</div>
        <h2>頁面尚未建立或路徑有誤</h2>
        <p>找不到手帳頁面：<code>${name}</code></p>
        <p><a class="card-action-btn" href="#overview">← 返回蛙類手帳首頁</a></p>
      </div>
    `;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 9. 目錄導航建置 (依 AGENTS.md 規範) ---

async function buildNav() {
  try {
    const rawText = await getText('index');
    const { body } = parseFrontmatter(rawText);

    const lines = body.split('\n');
    let currentCategory = '';
    const sections = {
      overview: [],
      species: [],
      concepts: [],
      sources: []
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## 總覽')) currentCategory = 'overview';
      else if (trimmed.startsWith('## 物種')) currentCategory = 'species';
      else if (trimmed.startsWith('## 概念')) currentCategory = 'concepts';
      else if (trimmed.startsWith('## 來源摘要')) currentCategory = 'sources';
      else if (trimmed.startsWith('## 科別')) currentCategory = '';
      else if (trimmed.startsWith('- [[')) {
        const linkMatch = trimmed.match(/- \[\[(.*?)\]\](?:\s*—\s*(.*))?/);
        if (linkMatch && currentCategory && sections[currentCategory]) {
          const target = linkMatch[1].trim();
          const desc = linkMatch[2] ? linkMatch[2].trim() : '';
          const name = target.split('/').pop();
          sections[currentCategory].push({ target, name, desc });
        }
      }
    });

    let navHtml = `
      <div class="nav-journal-group">
        <div class="nav-group-title">🗂️ 蛙類卡牌全覽</div>
        <a class="nav-item-link" href="#overview" data-target="overview" title="目前收錄 6 種台灣蛙類的手帳卡牌總覽與持續連載筆記格">
          <span class="nav-frog-dot">🟢</span>
          <span class="nav-item-text">卡牌總覽 (連載中 6/36)</span>
        </a>
      </div>

      <div class="nav-journal-group">
        <div class="nav-group-title">🐸 獨立物種手帳 (${sections.species.length})</div>
        ${sections.species.map(item => `
          <a class="nav-item-link" href="#${encodeURIComponent(item.target)}" data-target="${item.target}" title="${item.desc || item.name}">
            <span class="nav-item-bullet">🍃</span>
            <span class="nav-item-text">${item.name}</span>
          </a>
        `).join('')}
      </div>

      <div class="nav-journal-group">
        <div class="nav-group-title">💡 觀察概念與專題</div>
        ${sections.concepts.map(item => `
          <a class="nav-item-link" href="#${encodeURIComponent(item.target)}" data-target="${item.target}" title="${item.desc || item.name}">
            <span class="nav-item-bullet">📝</span>
            <span class="nav-item-text">${item.name}</span>
          </a>
        `).join('')}
      </div>

      <div class="nav-journal-group">
        <div class="nav-group-title">📚 來源文獻檔案</div>
        ${sections.sources.map(item => `
          <a class="nav-item-link" href="#${encodeURIComponent(item.target)}" data-target="${item.target}" title="${item.desc || item.name}">
            <span class="nav-item-bullet">📑</span>
            <span class="nav-item-text">${item.name}</span>
          </a>
        `).join('')}
      </div>

      <div class="nav-side-status-box">
        <div class="side-pulse-row">
          <span class="live-status-dot"></span>
          <span class="side-live-text">手帳持續連載擴充中</span>
        </div>
        <p class="side-live-desc">由 AI 與協作者依照 AGENTS.md 共同維護，收錄更多台灣野生蛙類中！</p>
      </div>
    `;

    nav.innerHTML = navHtml;
    updateActiveNav(decodeURIComponent(location.hash.slice(1)) || 'overview');
  } catch (e) {
    console.error('目錄載入失敗', e);
    nav.innerHTML = '<p class="nav-error">手帳目錄載入中…</p>';
  }
}

function updateActiveNav(activeTarget) {
  const links = document.querySelectorAll('.nav-item-link');
  links.forEach(link => {
    const target = link.getAttribute('data-target');
    if (target === activeTarget) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function route() {
  const name = decodeURIComponent(location.hash.slice(1)) || 'overview';
  loadPage(name);
}

window.addEventListener('hashchange', route);

// 初始化
buildNav();
route();
