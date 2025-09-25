import { useState } from "react";
import Story from "./story.jsx";
import { SCENARIOS } from "./scenarios";

export default function App() {
  const [active, setActive] = useState(null); // 'lab' | 'city' | 'orbit'

  if (active) {
    return <Story scenarioKey={active} baseContext={SCENARIOS[active].context} onBack={() => setActive(null)} />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold">DeepGame · Sprint 1</h1>
      <p className="mt-2 opacity-80">Select a scenario to start.</p>

      <div className="mt-6 grid gap-4 max-w-3xl">
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <div key={key} className="rounded-xl p-5 bg-slate-800/40">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <button className="mt-3 px-3 py-1.5 rounded bg-blue-600 text-white"
                    onClick={() => setActive(key)}>
              Play this scenario
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
