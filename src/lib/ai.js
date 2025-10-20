export async function askAI({ context, playerChoice }) {
  const resp = await fetch('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, playerChoice }),
  });

  let data = null;
  try { data = await resp.json(); } catch { /* ignore */ }

  if (!resp.ok) {
    const msg = data?.detail || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data.text;
}
