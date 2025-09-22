/**
 * SCENARIOS: a collection of short, self-contained stories.
 * - Each scenario has:
 *    id: string
 *    title: string
 *    blurb: short description for the selection screen
 *    nodes: { [nodeId: string]: { title, text, choices?: {label,to}[] } }
 * - The entry point of every scenario is nodes["start"].
 *
 * HOW TO ADD A NEW SCENARIO:
 * 1) Copy one of the scenario objects below.
 * 2) Change id/title/blurb.
 * 3) Replace nodes with your own mini story.
 * 4) Ensure all `choices[i].to` exist in nodes.
 */

export const SCENARIOS = [
  {
    id: "lab",
    title: "Lab Startup Day",
    blurb:
      "You’re a junior developer on Day 1 at a laboratory startup. Ship a demo before the stakeholder check-in!",
    nodes: {
      start: {
        title: "Arriving at the Lab",
        text:
          "It’s 9:00 AM. The PM says: “We need a tiny demo by 3 PM.”\nWhat do you tackle first?",
        choices: [
          { label: "Set up the project", to: "setup" },
          { label: "Draft a tiny spec", to: "spec" },
        ],
      },
      setup: {
        title: "Environment Setup",
        text:
          "You scaffold a React app and see the page render. Good start.",
        choices: [
          { label: "Add interaction flow", to: "flow" },
          { label: "Polish the UI first", to: "ui" },
        ],
      },
      spec: {
        title: "Mini Spec",
        text:
          "You write a one-pager: Start → Scene → Choice → Ending. Everyone nods.",
        choices: [
          { label: "Implement the flow", to: "flow" },
          { label: "Add a fun Easter egg", to: "oops" },
        ],
      },
      flow: {
        title: "Build the Flow",
        text:
          "You add basic branching. The demo is actually usable!",
        choices: [
          { label: "Ship the demo (Good Ending)", to: "endingGood" },
          { label: "Cram too many features", to: "oops" },
        ],
      },
      ui: {
        title: "UI Polish",
        text:
          "Sleek buttons and clean layout. Time is ticking though…",
        choices: [
          { label: "Focus back on flow", to: "flow" },
          { label: "Keep polishing", to: "oops" },
        ],
      },
      oops: {
        title: "😵 Scope Creep",
        text:
          "Trying to add everything at once slowed the team down. Lesson learned.",
      },
      endingGood: {
        title: "🎉 Demo Shipped",
        text:
          "Stakeholders love the clarity. You nailed a minimal, working prototype. Great job!",
      },
    },
  },
  {
    id: "detective",
    title: "City Detective",
    blurb:
      "As a new detective, you must choose your first lead wisely to crack a small case today.",
    nodes: {
      start: {
        title: "Briefing Room",
        text:
          "Two leads: a witness at the café or a CCTV request at HQ. Which first?",
        choices: [
          { label: "Interview the witness", to: "witness" },
          { label: "Pull CCTV footage", to: "cctv" },
        ],
      },
      witness: {
        title: "Café Witness",
        text:
          "The barista remembers a blue jacket and a backpack. Useful!",
        choices: [
          { label: "Check nearby alley", to: "alley" },
          { label: "Return to HQ", to: "cctv" },
        ],
      },
      cctv: {
        title: "CCTV Room",
        text:
          "You spot someone in a blue jacket heading toward the riverfront.",
        choices: [
          { label: "Search the riverfront", to: "river" },
          { label: "Cross-check with witness", to: "witness" },
        ],
      },
      alley: {
        title: "Narrow Alley",
        text:
          "You find a discarded blue jacket. There’s a gym card inside.",
        choices: [
          { label: "Trace the gym card (Good Ending)", to: "endingGood" },
          { label: "Chase a random rumor", to: "deadend" },
        ],
      },
      river: {
        title: "Riverfront",
        text:
          "Footprints fade near the docks. A guard mentions a person with a backpack.",
        choices: [
          { label: "Check local gyms", to: "endingGood" },
          { label: "Follow vague tips", to: "deadend" },
        ],
      },
      deadend: {
        title: "🕳️ Dead End",
        text:
          "Leads went cold. Next time, verify with concrete evidence first.",
      },
      endingGood: {
        title: "🔎 Case Progress",
        text:
          "You identified a strong suspect and secured a next-step warrant. Solid work!",
      },
    },
  },
  {
    id: "space",
    title: "Orbital Courier",
    blurb:
      "You pilot a small freighter in low orbit. Deliver a package during a minor system outage.",
    nodes: {
      start: {
        title: "Docking Bay",
        text:
          "Navigation is glitchy. Dispatch asks for a quick delivery window.",
        choices: [
          { label: "Reboot nav first", to: "reboot" },
          { label: "Manual course plotting", to: "manual" },
        ],
      },
      reboot: {
        title: "System Reboot",
        text:
          "Systems stabilize. ETA tight but feasible.",
        choices: [
          { label: "Engage auto-dock", to: "dock" },
          { label: "Try to optimize route too much", to: "overopt" },
        ],
      },
      manual: {
        title: "Manual Plotting",
        text:
          "You chart a safe but slower route.",
        choices: [
          { label: "Commit and deliver", to: "dock" },
          { label: "Risk a shortcut", to: "overopt" },
        ],
      },
      overopt: {
        title: "⚠️ Risky Shortcut",
        text:
          "Fuel margins drop. You abort and lose time. Not ideal today.",
      },
      dock: {
        title: "Successful Dock",
        text:
          "Package delivered. Client satisfied. You kept it simple and safe.",
      },
    },
  },
];

/**
 * Helper to fetch a scenario by id; falls back to the first scenario.
 */
export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
