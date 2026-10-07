// B18 — hardcover journal, "things i learned today." Unlock: teach it three true things,
// each in a sentence; it writes them in its journal.
const NEED = 3;
const TILTS = [-1.3, 0.8, -0.6];

export default function mount(kit) {
  const entries = kit.memory.get('entries', []);

  const wrap = kit.el('div', { class: 'g-center', style: { flexDirection: 'column', gap: '14px', width: '100%' } });
  const title = kit.el('p', { class: 'g-mono', text: 'things i learned today.' });
  const page = kit.el('div', { style: { minHeight: '140px', width: '100%', maxWidth: '480px' } });
  const row = kit.el('div', { style: { display: 'flex', gap: '8px', width: '100%', maxWidth: '480px' } });
  const input = kit.el('input', { type: 'text', placeholder: 'something true you learned today…', style: { flex: '1', font: 'inherit', padding: '10px 12px', border: '1px solid var(--rule)', borderRadius: '10px', background: 'var(--paper)', color: 'var(--ink)' } });
  const add = kit.el('button', { class: 'g-btn solid', id: 'teach', text: 'Teach it' });
  row.append(input, add);
  wrap.append(title, page, row);
  kit.stage.append(wrap);

  function renderPage() {
    page.replaceChildren(...entries.map((text, i) => kit.el('p', {
      text,
      style: { transform: `rotate(${TILTS[i % TILTS.length]}deg)`, fontFamily: 'var(--display)', fontSize: '19px', margin: '6px 0' },
    })));
  }
  renderPage();
  kit.status(`${entries.length}/${NEED}`);

  function submit() {
    const text = input.value.trim();
    if (!text) return;
    entries.push(text);
    kit.memory.set('entries', entries);
    input.value = '';
    renderPage();
    kit.status(`${entries.length}/${NEED}`);
    if (entries.length >= NEED) finish();
  }

  function finish() {
    row.remove();
    title.textContent = 'it knows three things now.';
    kit.win('it knows three things now.');
  }

  add.onclick = submit;
  kit.on(input, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
}
