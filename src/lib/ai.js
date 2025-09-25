export async function askAI({ context, playerChoice }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000); // 30s timeout

  const resp = await fetch('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, playerChoice }),
    signal: ctrl.signal
  }).catch(e => { throw new Error(e.name === 'AbortError' ? 'timeout' : e.message) });

  clearTimeout(t);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return data.text;
}
