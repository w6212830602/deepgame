// src/App.jsx
import { useMemo, useState } from "react";
import Story from "./story.jsx";
import { SCENARIOS } from "./scenarios.js"; 

export default function App() {
  // 物件 → 陣列 [{ key, title, context, ... }]
  const scenarioList = useMemo(() => {
    if (!SCENARIOS || typeof SCENARIOS !== "object") return [];
    return Object.entries(SCENARIOS).map(([key, val]) => ({ key, ...val }));
  }, []);

  const [active, setActive] = useState(null);

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
      {/* 背景 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,#2b2a5a_0%,transparent_60%),radial-gradient(1000px_500px_at_90%_-20%,#432a6b_0%,transparent_60%),linear-gradient(180deg,#0b132b_0%,#0b1224_60%,#0a0f1c_100%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">DeepGame</h1>
          <p className="mt-1 text-slate-300/85">Select a scenario to start.</p>
        </header>

        {scenarioList.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-5 text-slate-200 backdrop-blur">
            <div className="mb-1 font-semibold">No scenarios found.</div>
            <div className="text-sm text-slate-300/80">
              Check <code>src/scenarios.js</code>.
            </div>
          </div>
        ) : (
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
                  <button onClick={() => alert('Preview coming soon')} className="btn btn-sm btn-ghost">Preview</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
