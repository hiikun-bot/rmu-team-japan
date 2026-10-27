// チームJAPAN サイト共通の部品
// 時刻はすべて「エドモントン現地時刻（MDT＝UTC-6）」で持ち、表示のときに日本時間も並べる。
// カナダの夏時間は 2026-11-01 に終わるので、大会期間中の時差は日本が15時間進んでいる。

const TZ_LOCAL = 'America/Edmonton';
const TZ_JP = 'Asia/Tokyo';

// 大会の大事な時刻（現地時刻）
const KEY = {
  final: '2026-10-30T20:00:00-06:00',     // インターナショナル・ファイナル開始
  voteClose: '2026-10-30T21:00:00-06:00', // オンライン投票締切（日本時間 10/31 12:00）
};

const VOTE_LINKS = {
  kana: 'https://rmu.altaph.com/product/rmu-female-japan/',
  rie: 'https://rmu.altaph.com/product/rmu-female-japan-2/',
  sanshiro: 'https://rmu.altaph.com/product/rmu-male-japan/',
  satoshi: 'https://rmu.altaph.com/product/rmu-male-japan-2/',
};

function fmt(date, tz, opts) {
  return new Intl.DateTimeFormat('ja-JP', { timeZone: tz, ...opts }).format(date);
}
function hm(date, tz) {
  return fmt(date, tz, { hour: '2-digit', minute: '2-digit', hour12: false });
}
function mdw(date, tz) {
  return fmt(date, tz, { month: 'numeric', day: 'numeric', weekday: 'short' });
}

// Googleカレンダー登録リンク（日本時間で作る）
function gcalLink({ title, start, end, details = '', location = '' }) {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(s.getTime() + 60 * 60 * 1000);
  const stamp = (d) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ_JP, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(d).map((x) => [x.type, x.value]));
    return `${p.year}${p.month}${p.day}T${p.hour === '24' ? '00' : p.hour}${p.minute}${p.second}`;
  };
  const q = new URLSearchParams({
    action: 'TEMPLATE', text: title, dates: `${stamp(s)}/${stamp(e)}`,
    ctz: TZ_JP, details, location,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// カウントダウン（要素の中に 日・時間・分・秒 を描く）
function countdown(el, target, doneText) {
  const t = new Date(target).getTime();
  const tick = () => {
    const ms = t - Date.now();
    if (ms <= 0) { el.innerHTML = `<p class="sub">${doneText}</p>`; return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24;
    const m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    el.innerHTML = `<div class="count">
      <div><b>${d}</b><small>日</small></div><div><b>${h}</b><small>時間</small></div>
      <div><b>${m}</b><small>分</small></div><div><b>${s}</b><small>秒</small></div></div>`;
    setTimeout(tick, 1000);
  };
  tick();
}

// 下部ナビ
function bottomNav(current) {
  const items = [
    ['index.html', '🏠', 'ホーム'],
    ['vote.html', '🗳️', '投票'],
    ['guide.html', '📖', 'しおり'],
    ['speech.html', '🎤', 'スピーチ'],
    ['photos.html', '📸', '写真'],
  ];
  const nav = document.createElement('nav');
  nav.className = 'bnav';
  nav.innerHTML = `<div class="wrap">${items.map(([href, i, label]) =>
    `<a href="${href}"${href === current ? ' aria-current="page"' : ''}><span class="i">${i}</span>${label}</a>`).join('')}</div>`;
  document.body.appendChild(nav);
}

// localStorage は使えない環境もあるので必ず try で包む
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 保存できなくても動く */ } },
};
