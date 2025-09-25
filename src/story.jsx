import { useState } from "react";
import { askAI } from "./lib/ai";

export default function Story({ scenarioKey, baseContext, onBack }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function startGame() {
    setErr(""); setLoading(true);
    try {
      const text = await askAI({ context: baseContext, playerChoice: "" });
      setLog([{ text }]);
    } catch (e) {
      setErr("Failed to contact AI. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function choose(optionText) {
    setErr(""); setLoading(true);
    try {
      const context = [baseContext, ...log.map(x => x.text)].join("\n\n");
      const text = await askAI({ context, playerChoice: optionText });
      setLog(prev => [...prev, { text }]);
    } catch (e) {
      setErr("AI error. Try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const last = log.at(-1);
  const choices = last?.text.match(/^\s*\d+\).+$/gm) || [];
  const noChoices = last && choices.length === 0;

  return (
    <div className="p-8 max-w-3xl">
      <button className="mb-4 text-sm opacity-80 hover:opacity-100" onClick={onBack}>← Back</button>
      <h2 className="text-2xl font-semibold mb-2">{scenarioKey}</h2>

      <div className="flex gap-3 mb-4">
        <button onClick={startGame} disabled={loading} className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-60">
          {log.length ? "Restart" : "Start"}
        </button>
        {loading && <span className="opacity-80">Generating…</span>}
        {err && <span className="text-red-400">{err}</span>}
      </div>

      <div className="space-y-5">
        {log.map((s, i) => (
          <article key={i} className="leading-7 whitespace-pre-wrap">{s.text}</article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {choices.map((c, i) => (
          <button key={i} onClick={() => choose(c)}
                  className="px-3 py-1.5 rounded bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-60"
                  disabled={loading}>
            {c}
          </button>
        ))}
        {noChoices && (
          <button onClick={() => choose("Continue")} className="px-3 py-1.5 rounded bg-slate-700 text-white">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
