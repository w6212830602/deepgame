async function callServer(promptContext, promptChoice) {
  const resp = await fetch('/api/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: promptContext,
      playerChoice: promptChoice,
    }),
  });

  let data = null;
  try {
    data = await resp.json();
  } catch {
    // ignore JSON parse error so we can throw nicely below
  }

  if (!resp.ok) {
    const msg = data?.detail || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return data.text || '';
}


function isTruncated(txt) {
  if (!txt) return true;

  const has1 = txt.includes('1)');
  const has2 = txt.includes('2)');

  if (!has1 || !has2) return true;

  const trimmed = txt.trim();
  const lastChar = trimmed.slice(-1);

  const okEndings = ['.', '!', '?', '"', "'", '”'];
  if (!okEndings.includes(lastChar)) {
    return true;
  }

  return false;
}


function mergeStory(a, b) {
  if (!b) return a;

  const tail = a.slice(-120); 
  const overlapIndex = b.indexOf(tail);

  if (overlapIndex > -1) {
    return a + b.slice(overlapIndex + tail.length);
  }

  return a + '\n' + b;
}


export async function askAI({ context, playerChoice }) {
  const firstText = await callServer(context, playerChoice);

  const incomplete = isTruncated(firstText);

  if (!incomplete) {
    return firstText;
  }

  const continuationContext =
    context +
    "\n\n[STORY SO FAR]\n" +
    firstText +
    "\n\n[REQUEST]\nContinue EXACTLY where you stopped. " +
    "Finish any unfinished numbered choice. " +
    "If you already started listing 1), 2), 3), complete the remaining choices. " +
    "Do not repeat text that was already shown to the player.";

  const secondText = await callServer(continuationContext, '(continue)');

  // 4. 把兩段合併，避免重複
  return mergeStory(firstText, secondText);
}
