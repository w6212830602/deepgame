import { useEffect, useRef, useState } from "react";
import { askAI } from "./lib/ai";

const MODES = ["Do", "Say", "Think", "Ask"];

// 輔助：把 **粗體** 轉 <strong>、空行轉段落
function renderRich(text) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(\r?\n){2,}/g, "</p><p>");
  return <div className="story-log" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

const OUTPUT_RULES = `
---
SYSTEM / OUTPUT RULES:
- Continue the story based on the player's freeform input (action, dialogue, thought, or question).
- DO NOT list numbered choices. End with a natural prompt inviting the next input (e.g., "What do you do next?").
- Keep paragraphs readable (2–3 sentences per paragraph). Avoid truncation.
- Keep the answer complete in 3 paragraphs or less.
`;

export default function StoryFreeFixed({ scenarioKey, baseContext, onBack }) {
  const [log, setLog] = useState([]); // { text, isPlayer? }
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [started, setStarted] = useState(false);

  // 底部輸入狀態
  const [mode, setMode] = useState(MODES[0]); // 預設 Do
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, loading]);

  async function startGame() {
    setErr(""); setLoading(true);
    try {
      const text = await askAI({
        context: baseContext + OUTPUT_RULES,
        playerChoice: "Begin the introduction and invite the player's first action."
      });
      setLog([{ text }]);
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (e) {
      setErr(e.message || "AI error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAction() {
    if (!started) return startGame();
    const content = input.trim();
    if (!content) return;
    const playerLine = `**${mode}:** ${content}`;
    setLog(prev => [...prev, { text: `🧍‍♂️ ${playerLine}`, isPlayer: true }]);
    setInput("");

    setErr(""); setLoading(true);
    try {
      const context = [baseContext, OUTPUT_RULES, ...log.map(x => x.text), `Player ${playerLine}`].join("\n\n");
      const text = await askAI({
        context,
        playerChoice: `Player chooses to ${mode}: ${content}. Continue the story (no numbered choices).`
      });
      setLog(prev => [...prev, { text }]);
    } catch (e) {
      console.error(e);
      setErr("AI error. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAction();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      // Switch mode
      const idx = MODES.indexOf(mode);
      setMode(MODES[(idx + 1) % MODES.length]);
    }
  }

  function restart() {
    setLog([]);
    setStarted(false);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,#2b2a5a_0%,transparent_60%),radial-gradient(1000px_500px_at_90%_-20%,#432a6b_0%,transparent_60%),linear-gradient(180deg,#0b132b_0%,#0b1224_60%,#0a0f1c_100%)]" />

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-4 pb-40 pt-8">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost btn-back">← Back</button>
          <h2 className="text-2xl font-bold text-slate-100">{scenarioKey}</h2>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn btn-sm btn-ghost" onClick={restart}>Restart</button>
            {loading && <span className="animate-pulse text-sm text-slate-300/80">Generating…</span>}
            {err && <span className="text-red-400 text-sm">{err}</span>}
          </div>
        </div>

        {/* Story Area */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-xl backdrop-blur">
          {log.length === 0 ? (
            <p className="text-slate-300/85">
              Press <strong>Start</strong> to begin — or just type in the box below and hit Enter.
            </p>
          ) : (
            <div className="space-y-5">
              {log.map((s, i) => (
                <article key={i} className={s.isPlayer ? "text-sky-300 font-semibold" : ""}>
                  {s.isPlayer ? <div className="whitespace-pre-wrap">{s.text}</div> : renderRich(s.text)}
                </article>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </section>
      </div>

      {/* Docked Input Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto w-full max-w-4xl px-4 pb-5">
          <div className="rounded-2xl border border-white/15 bg-black/55 p-3 shadow-2xl backdrop-blur">
            {/* Switch mode */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {MODES.map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`btn btn-sm ${mode === m ? "" : "btn-ghost"}`}
                >
                  {m}
                </button>
              ))}
              <div className="ml-auto text-xs text-slate-300/70">
              </div>
            </div>

            {/* Input + Submit */}
            <div className="chat-input-wrap">
            <span className="chat-chip">{mode}</span>
            <textarea
                ref={inputRef}
                className="chat-input"
                rows={1}
                value={input}
                placeholder={
                started
                    ? `Type what you want to ${mode.toLowerCase()}...`
                    : "Press Start or just type and hit Enter to begin"
                }
                onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "0px";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                }}
                onKeyDown={onKeyDown}
            />
            <button onClick={submitAction} disabled={loading} className="btn chat-send">
                {started ? "Send" : "Start"}
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
