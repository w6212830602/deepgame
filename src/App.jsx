import { useState } from "react";
import "./index.css";
import { SCENARIOS, getScenarioById } from "./story";

function ScenarioCard({ scenario, onSelect }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h2>{scenario.title}</h2>
      <p>{scenario.blurb}</p>
      <button className="btn primary" onClick={() => onSelect(scenario.id)}>
        Play this scenario
      </button>
    </div>
  );
}

function ScenarioSelect({ onPick }) {
  return (
    <div className="container">
      <div className="card">
        <h1>DeepGame · Sprint 1</h1>
        <p>Select a scenario to start. These are short sample stories.  
           Support members can propose new ideas and we’ll add them here.</p>
      </div>
      <div style={{ width: "min(720px, 92vw)", marginTop: 16 }}>
        {SCENARIOS.map((s) => (
          <ScenarioCard key={s.id} scenario={s} onSelect={onPick} />
        ))}
      </div>
    </div>
  );
}

function Scene({ node, onChoose, onRestartScenario, onChangeScenario, canGoBack, onBack }) {
  const isEnding = !node.choices || node.choices.length === 0;

  return (
    <div className="card">
      <div className="topbar">
        {canGoBack ? (
          <button className="btn ghost" onClick={onBack}>
            &larr; Back
          </button>
        ) : (
          <span />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" onClick={onRestartScenario}>Restart Scenario</button>
          <button className="btn ghost" onClick={onChangeScenario}>Change Scenario</button>
        </div>
      </div>

      <h2>{node.title}</h2>
      <pre className="text">{node.text}</pre>

      <div className="choices">
        {isEnding ? (
          <button className="btn primary" onClick={onRestartScenario}>
            Play Again
          </button>
        ) : (
          node.choices.map((c, i) => (
            <button key={i} className="btn" onClick={() => onChoose(c.to)}>
              {c.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const scenario = selectedScenarioId ? getScenarioById(selectedScenarioId) : null;
  const nodes = scenario?.nodes ?? {};
  const [history, setHistory] = useState(["start"]);

  const currentId = history[history.length - 1];
  const currentNode = nodes[currentId];

  const handlePickScenario = (id) => {
    setSelectedScenarioId(id);
    setHistory(["start"]);
  };

  const handleChoose = (to) => setHistory((h) => [...h, to]);
  const handleBack = () =>
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));

  const restartScenario = () => setHistory(["start"]);
  const changeScenario = () => {
    setSelectedScenarioId(null);
    setHistory(["start"]);
  };

  if (!selectedScenarioId) {
    return <ScenarioSelect onPick={handlePickScenario} />;
  }

  return (
    <div className="container">
      <Scene
        node={currentNode}
        onChoose={handleChoose}
        onRestartScenario={restartScenario}
        onChangeScenario={changeScenario}
        canGoBack={history.length > 1}
        onBack={handleBack}
      />
      <footer className="footer">
        <small>
          Scenario: {scenario.title} · Path: {history.join(" → ")}
        </small>
      </footer>
    </div>
  );
}
