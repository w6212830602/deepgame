import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import Story from "./story_freeinput.jsx";
import { SCENARIOS } from "./scenarios.js";

export default function App() {
  const scenarioList = useMemo(() => {
    if (!SCENARIOS || typeof SCENARIOS !== "object") return [];
    return Object.entries(SCENARIOS).map(([key, val]) => ({ key, ...val }));
  }, []);

  const [active, setActive] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const handleCloseCustom = useCallback(() => setCustomOpen(false), []);


  const handleCreateCustom = useCallback((form) => {
  const context = buildContext(form);
  const custom = { key: "custom", title: form.title || "Custom Scenario", context };
  setActive(custom);
  setCustomOpen(false);
}, []);


  if (active) {
    return (
      <Story
        scenarioKey={active.title || active.key}
        baseContext={active.context || active.baseContext || ""}
        onBack={() => setActive(null)}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,#2b2a5a_0%,transparent_60%),radial-gradient(1000px_500px_at_90%_-20%,#432a6b_0%,transparent_60%),linear-gradient(180deg,#0b132b_0%,#0b1224_60%,#0a0f1c_100%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">DeepGame</h1>
          <p className="mt-1 text-slate-300/85">Select a scenario to start — or create your own.</p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenarioList.map((s, idx) => (
            <article
              key={s.key || idx}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <div className="h-28 w-full bg-[radial-gradient(200px_200px_at_0%_0%,rgba(124,92,255,.5),transparent_60%),radial-gradient(200px_200px_at_100%_100%,rgba(48,224,161,.4),transparent_60%),linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,0))]" />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-lg font-bold text-slate-100">{s.title}</h3>
                <p className="text-sm leading-6 text-slate-300/85">
                  {s.description || "An interactive, text-first adventure powered by AI."}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <button onClick={() => setActive(s)} className="btn btn-sm">Play this scenario</button>
                  <button onClick={() => setPreviewItem(s)} className="btn btn-sm btn-ghost">Preview</button>
                </div>
              </div>
            </article>
          ))}

          {/* Create your own card */}
          <article
            className="group flex flex-col overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <div className="h-28 w-full grid place-items-center bg-[radial-gradient(180px_180px_at_50%_50%,rgba(48,224,161,.25),transparent_60%)]">
              <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-slate-200">
                ✨ Custom scenario
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="text-lg font-bold text-slate-100">Create your own</h3>
              <p className="text-sm leading-6 text-slate-300/85">
                Write your own intro, goal, constraints, and tone — then play it immediately.
              </p>
              <div className="mt-auto flex gap-2 pt-2">
                <button onClick={() => setCustomOpen(true)} className="btn btn-sm">Start building</button>
                <button onClick={() => setCustomOpen(true)} className="btn btn-sm btn-ghost">Preview</button>
              </div>
            </div>
          </article>
        </section>
      </div>

      {previewItem && (
        <PreviewModal
          scenario={previewItem}
          onClose={() => setPreviewItem(null)}
          onStart={() => { setActive(previewItem); setPreviewItem(null); }}
        />
      )}

      {customOpen && (
        <CustomScenarioModal
          onClose={handleCloseCustom}
          onCreate={handleCreateCustom}
        />
      )}
    </div>
  );
}

/* Preview Modal */
function PreviewModal({ scenario, onClose, onStart }) {
  const { title, context = "" } = scenario;
  const meta = parseMeta(context);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center px-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
            <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {meta.goal && <Badge label="Goal" value={meta.goal} />}
              {meta.constraints && <Badge label="Constraints" value={meta.constraints} />}
              {meta.tone && <Badge label="Tone" value={meta.tone} />}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-slate-200 leading-7">
                {meta.intro || "A short, focused interactive story. Make choices and watch the narrative branch."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button className="btn btn-ghost" onClick={onClose}>Close</button>
              <button className="btn" onClick={onStart}>Start this scenario</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function parseMeta(context) {
  const get = (label) => {
    const m = context.match(new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?:\\n[A-Z][a-zA-Z ]+:|$)`, "i"));
    return m ? m[1].trim().replace(/\s+/g, " ") : "";
  };
  const goal = get("Goal");
  const constraints = get("Constraints");
  const tone = get("Tone");
  const intro = context.split("\n")[0]?.trim() || "";
  return { goal, constraints, tone, intro };
}

function Badge({ label, value }) {
  if (!value) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">
      <span className="opacity-80">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* Custom Scenario Modal*/
const CustomScenarioModal = memo(function CustomScenarioModal({ onClose, onCreate }) {
  const [data, setData] = useState({
    title: "",
    intro: "",
    goal: "",
    tone: "light, energetic, practical",
    constraints: "",
  });

  const titleRef = useRef(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const canSubmit =
    (data.title?.trim().length || 0) >= 2 &&
    (data.intro.trim().length > 0 || data.goal.trim().length > 0);

  const Field = ({ label, htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block">
      <div className="mb-1 text-sm font-medium text-slate-300">{label}</div>
      {children}
    </label>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
            <h3 className="text-xl font-extrabold bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Create your own scenario
            </h3>
            <button className="btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>

          <div className="p-5 space-y-4" onClick={(e)=>e.stopPropagation()}>
            <Field label="Title" htmlFor="title">
              <input
                id="title"
                value={data.title}
                onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                className="ui-input"
                placeholder="e.g., Neon Heist in Old Tokyo"
              />
            </Field>

            <Field label="Intro / Opening" htmlFor="intro">
              <textarea
                id="intro"
                rows={3}
                value={data.intro}
                onChange={(e) => setData(prev => ({ ...prev, intro: e.target.value }))}
                className="ui-textarea"
                placeholder="One or two sentences to set the scene…"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Goal" htmlFor="goal">
                <input
                  id="goal"
                  value={data.goal}
                  onChange={(e) => setData(prev => ({ ...prev, goal: e.target.value }))}
                  className="ui-input"
                  placeholder="e.g., Steal the prototype and escape"
                />
              </Field>
              <Field label="Tone" htmlFor="tone">
                <input
                  id="tone"
                  value={data.tone}
                  onChange={(e) => setData(prev => ({ ...prev, tone: e.target.value }))}
                  className="ui-input"
                  placeholder="e.g., grounded, witty noir"
                />
              </Field>
            </div>

            <Field label="Constraints (optional)" htmlFor="constraints">
              <input
                id="constraints"
                value={data.constraints}
                onChange={(e) => setData(prev => ({ ...prev, constraints: e.target.value }))}
                className="ui-input"
                placeholder="e.g., limited time, unreliable ally…"
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn"
                disabled={!canSubmit}
                onClick={() => onCreate({ ...data })}
              >
                Start with this scenario
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});


function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-semibold text-slate-200">{label}</div>
      {children}
    </label>
  );
}

/*  helpers  */
function buildContext({ intro, goal, constraints, tone }) {
  const parts = [];
  if (intro?.trim()) parts.push(intro.trim());
  if (goal?.trim()) parts.push(`Goal: ${goal.trim()}`);
  if (constraints?.trim()) parts.push(`Constraints: ${constraints.trim()}`);
  if (tone?.trim()) parts.push(`Tone: ${tone.trim()}`);
  return parts.join("\n");
}
