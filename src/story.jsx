import { useEffect, useMemo, useRef, useState } from "react";
import { askAI } from "./lib/ai";

function renderRich(text) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(\r?\n){2,}/g, "</p><p>");
  return <div className="story-log" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

function stripOptions(text) {
  return text.replace(/^\s*\d+\).+$/gm, "").trim();
}

function parseChoices(text) {
  const lines = text.match(/^\s*\d+\).+$/gm) || [];
  return lines.map((line) => {
    const m = line.match(/^\s*(\d+)\)\s*(.+)$/);
    const num = m ? m[1] : "";
    const label = (m ? m[2] : line).replace(/\*\*/g, "").trim();
    return { num, label, raw: line.trim() };
  });
}

function extractChoices(text) {
  return (text.match(/^\s*\d+\).+$/gm) || []).map((s) =>
    s.replace(/^\s*\d+\)\s*/, "").trim()
  );
}

const OUTPUT_RULES = `
---
OUTPUT RULES:
- Continue the story based on the player's last choice.
- Then list NEW choices as separate lines: "1) <short, self-contained label>", "2) ...".
- Choices must reflect the UPDATED situation; DO NOT repeat the previous turn's choices verbatim.
- Each choice must be a complete phrase (>= 3 words) and NOT end mid-word.
- Do NOT truncate. If you are running out of tokens, output choices first.
`;

function isIncompleteResponse(text) {
  const choices = extractChoices(text);
  const tooFew = choices.length < 2;
  const anyTooShort = choices.some((l) => l.split(/\s+/).length < 3);
  const endsWeird = !/[.!?」』”’）)\]]\s*$/.test(text.trim());
  return tooFew || anyTooShort || endsWeird;
}

async function maybeFix(text, context) {
  if (!isIncompleteResponse(text)) return text;

  const fixPrompt = `
The previous reply may be truncated.
ONLY OUTPUT a corrected choices list, one per line, like:
1) ...
2) ...
3) ...
(No narration, no extra words.)
`;
  try {
    const fix = await askAI({
      context: context + "\n\n" + fixPrompt,
      playerChoice: "Continue the previous response by completing the choices list."
    });
    const fixedChoices = extractChoices(fix);
    if (fixedChoices.length >= 2) {
      const narrative = text.replace(/^\s*\d+\).+$/gm, "").trim();
      return (narrative + "\n" + fixedChoices.map((c, i) => `${i + 1}) ${c}`).join("\n")).trim();
    }
    return text;
  } catch {
    return text;
  }
}


function sameChoices(a, b) {
  if (!a.length || !b.length) return false;
  if (a.length !== b.length) return false;
  const na = a.map((x) => x.toLowerCase());
  const nb = b.map((x) => x.toLowerCase());
  return na.every((x, i) => x === nb[i]);
}

async function regenerateDifferentChoices(context, lastChoice, prevChoices) {
  const avoid = prevChoices.map((c, i) => `${i + 1}) ${c}`).join("\n");
  const prompt = `
The previous set of choices repeated the earlier turn.
ONLY OUTPUT a new choices list (no narration). Provide 2–3 alternatives that DIFFER from:
${avoid}
Format strictly:
1) ...
2) ...
3) ... (optional)
`;
  const text = await askAI({
    context: context + "\n\n" + prompt,
    playerChoice: `Player chose: "${lastChoice}". Continue with different choices.`
  });
  return extractChoices(text);
}

function mergeNarrativeWithChoices(narrative, choices) {
  return `${narrative.trim()}\n${choices.map((c, i) => `${i + 1}) ${c}`).join("\n")}`.trim();
}


export default function Story({ scenarioKey, baseContext, onBack }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, loading]);

  const last = log.at(-1);
  const choices = useMemo(() => (last ? parseChoices(last.text) : []), [last]);
  const noChoices = !!last && choices.length === 0;

  async function startGame() {
    setErr("");
    setLoading(true);
    try {
      const ctx = baseContext + OUTPUT_RULES;
      const raw = await askAI({ context: ctx, playerChoice: "" });
      const fixed = await maybeFix(raw, ctx);
      setLog([{ text: fixed }]);
    } catch (e) {
      console.error(e);
      setErr(e.message || "AI error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function choose(optionLabel) {
    setErr("");
    setLoading(true);
    try {
      const prevAI = log.at(-1)?.text || "";
      const prevChoices = extractChoices(prevAI);

      const ctx = [baseContext, ...log.map((x) => x.text)].join("\n\n") + OUTPUT_RULES;
      const raw = await askAI({
        context: ctx,
        playerChoice: `Player chooses: "${optionLabel}". Continue the story and provide NEW choices.`
      });

      let fixed = await maybeFix(raw, ctx);

      // Check for repeated choices
      const newChoices = extractChoices(fixed);
      if (sameChoices(prevChoices, newChoices)) {
        const narrativeOnly = fixed.replace(/^\s*\d+\).+$/gm, "").trim();
        const regenerated = await regenerateDifferentChoices(ctx, optionLabel, prevChoices);
        if (regenerated.length >= 2) {
          fixed = mergeNarrativeWithChoices(narrativeOnly, regenerated);
        }
      }

      setLog((prev) => [...prev, { text: fixed }]);
    } catch (e) {
      console.error(e);
      setErr("AI error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,#2b2a5a_0%,transparent_60%),radial-gradient(1000px_500px_at_90%_-20%,#432a6b_0%,transparent_60%),linear-gradient(180deg,#0b132b_0%,#0b1224_60%,#0a0f1c_100%)]" />

      <div className="relative mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost btn-back">← Back</button>
          <h2 className="text-2xl font-bold text-slate-100">{scenarioKey}</h2>
          <div className="ml-auto flex items-center gap-3">
            {err && (
              <span className="rounded-lg bg-rose-500/20 px-2 py-1 text-sm text-rose-200">
                {err}
              </span>
            )}
            {loading && (
              <span className="animate-pulse text-sm text-slate-300/80">Generating…</span>
            )}
          </div>
        </div>

        {/*  layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* cards */}
          <section className="lg:col-span-2 rounded-2xl border border-white/15 bg-white/5 p-5 shadow-xl backdrop-blur">
            <div className="max-h-[62vh] overflow-y-auto pr-1">
              {log.length === 0 ? (
                <p className="text-slate-300/80">
                  Press <strong>Start</strong> to begin your adventure…
                </p>
              ) : (
                <div className="space-y-6">
                  {log.map((s, i) => (
                    <article key={i}>{renderRich(stripOptions(s.text))}</article>
                  ))}
                  {loading && <p className="text-slate-300/80">…thinking</p>}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </section>

          {/* Control Panel */}
          <aside className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-300/85">
                {log.length ? "Pick an action" : "Get started"}
              </div>
              <button onClick={startGame} disabled={loading} className="btn btn-lg">
                {log.length ? "Restart" : "Start"}
              </button>
            </div>

            <div className="space-y-2">
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => choose(c.label)}   
                  disabled={loading}
                  className="option"
                >
                  <span className="num">{c.num}</span>
                  <span>{c.label}</span>
                </button>
              ))}

              {noChoices && (
                <button onClick={() => choose("Continue")} className="option">
                  <span className="num">→</span>
                  <span>Continue</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
