# 🌳 Skill Tree App

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![React Flow](https://img.shields.io/badge/React%20Flow-@xyflow%2Freact-blueviolet)](https://reactflow.dev/)
[![ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-f7b93e?logo=prettier)](https://prettier.io/)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-enabled-brightgreen)]()

A visual **Skill Tree Builder** built with React and [React Flow](https://reactflow.dev/).  
Create skills, connect prerequisites, lock/unlock nodes with validation, and persist everything to LocalStorage.  
Accessibility-first, thoroughly tested with Jest + React Testing Library, and code-quality enforced with ESLint + Prettier.

---

## ✨ Features

- 🎨 **Interactive skill nodes**: `name`, `description`, `cost`, `completed` state with lock/unlock UI.
- ➕ **Add skills** with a polished MUI dialog.
- 🔗 **Edges with arrows** to define prerequisites (source → target).
- 🔒 **Prerequisite validation**: a node unlocks only if all its incoming prerequisites are completed.
- ↩️ **Recursive re-lock**: locking a prerequisite re-locks all dependents down the chain.
- ♿ **Accessibility-first**:
  - ARIA roles & labels
  - Keyboard navigation: **Enter/Space** toggles, **Esc** closes dialog
- 🔍 **Search & highlight**:
  - Debounced search (custom `useDebounce`)
  - Highlights nodes and edges where **either** endpoint matches
- 🧩 **Cycle prevention**:
  - Graph validation rejects any edge that would introduce a cycle (toast error).
- 💾 **LocalStorage persistence**: nodes & edges are saved on every change.
- 🧪 **Reliable tests**:
  - Form validation (name + description)
  - Keyboard interactions
  - Edge connect + cycle prevention
  - Recursive locking
  - Search highlighting
  - LocalStorage updates on change
- 🧹 **Code quality**: ESLint + Prettier, focused hooks (`useLocalStorage`, `useDebounce`), and utilities (`detectCycle`, `searchUtil`).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x+ recommended
- **npm**
- Core libraries used:
  - `react`, `react-dom`
  - `@xyflow/react` (React Flow)
  - `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
  - `react-hot-toast`
  - `dagre` (optional auto-layout)
- Dev tools:
  - `vite`, `@vitejs/plugin-react`
  - `eslint`, `eslint-config-prettier`, `eslint-plugin-prettier`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
  - `prettier`
  - `jest`, `babel-jest`, `jest-environment-jsdom`, `identity-obj-proxy`
  - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
  - `@babel/preset-env`, `@babel/preset-react`

> If you need to install from scratch:
>
> ```bash
> npm install react react-dom @xyflow/react react-flow @mui/material @mui/icons-material @emotion/react @emotion/styled react-hot-toast dagre
> npm install -D vite @vitejs/plugin-react eslint @eslint/js eslint-config-prettier eslint-plugin-prettier eslint-plugin-react-hooks eslint-plugin-react-refresh prettier jest babel-jest jest-environment-jsdom identity-obj-proxy @testing-library/react @testing-library/jest-dom @testing-library/user-event @babel/preset-env @babel/preset-react
> ```

### Installation

```bash
git clone https://github.com/pranjalarora98/skill-tree-app.git
cd skill-tree-app
npm install
```

### Run locally

```bash
npm run dev
```
Vite dev server runs at **http://localhost:5173**.

### Build & Preview

```bash
npm run build
npm run preview
```

---

## 📦 NPM Scripts

These are aligned with your `package.json`.

| Script              | What it does                                                |
|--------------------|-------------------------------------------------------------|
| `dev`              | Start Vite dev server                                       |
| `build`            | Build production bundle (Vite)                              |
| `preview`          | Preview the production build                                |
| `lint`             | Run ESLint on `src/**/*.{js,jsx}`                           |
| `lint:fix`         | ESLint with `--fix`                                         |
| `format`           | Prettier format `src/**/*.{js,jsx}`                         |
| `test`             | Run Jest tests                                              |
| `test:coverage`    | Jest with coverage report                                   |

---

## 🧪 Testing & Coverage

Run tests:

```bash
npm run test
```


Coverage:

```bash
npm run test:coverage
```

- Coverage output lives in the `coverage/` folder.
- Tests include:
  - **SkillForm** validation (name & description required; focus moves to errored field)
  - **Graph rules** (cycle prevention on `onConnect`)
  - **Recursive lock** (locking a completed prereq re-locks all dependents)
  - **Keyboard a11y** (Enter/Space toggle, Esc closes dialog)
  - **LocalStorage persistence** for nodes/edges on every change
  - **Search highlighting** (nodes + edges, with debounced input)

### Common Test Gotchas (and fixes)

- **MUI TouchRipple “act(...)” warnings (especially in coverage):**  
  Wrap user events with `act(...)`:
  ```js
  import { act } from '@testing-library/react';

  await act(async () => {
    await user.click(screen.getByRole('button', { name: /add skill/i }));
  });
  ```
  Or mock ripple in tests:
  ```js
  jest.mock('@mui/material/ButtonBase/TouchRipple', () => () => null);
  ```

- **Debounce delays breaking search assertions:**  
  If you’re using the real debounce (e.g., 300ms), advance timers:
  ```js
  jest.useFakeTimers();
  await user.type(searchInput, 'Node');
  jest.advanceTimersByTime(300);
  ```
  Or mock the hook:
  ```js
  jest.mock('../hooks/useDebounce', () => ({
    __esModule: true,
    default: (value) => value,
  }));
  ```

- **Timeouts in complex tests** (recursive toggles + debounce + toasts):  
  Increase per-test timeout:
  ```js
  test('deep recursion', async () => { /* ... */ }, 20000);
  ```
  Or globally in `jest.config.js`:
  ```js
  module.exports = { testTimeout: 20000 };
  ```

---

## 🧹 Linting & Formatting

Lint:

```bash
npm run lint
```

Fix:

```bash
npm run lint:fix
```

Format with Prettier:

```bash
npm run format
```

---

## 📂 Project Structure

```
skill-tree-app/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ Header.jsx           # Top controls: search, add, clear
│  │  ├─ SkillBuilder.jsx     # Main container: state mgmt, handlers & dialog
│  │  ├─ SkillForm.jsx        # MUI form with validation (name + description)
│  │  └─ SkillTree.jsx        # React Flow wrapper (nodes, edges, controls)
│  ├─ hooks/
│  │  ├─ useDebounce.js       # Debounced value hook
│  │  └─ useLocalStorage.js   # LocalStorage <-> state hook
│  ├─ utils/
│  │  ├─ detectCycle.js       # DFS-based cycle detection for directed graph
│  │  └─ searchUtil.js        # Node/edge highlighting based on search
│  ├─ App.jsx                 # Entry view; may import SkillBuilder
│  ├─ index.css
│  └─ main.jsx
├─ src/test/
│  ├─ App.test.js
│  └─ SkillForm.test.js
├─ package.json
├─ .eslintrc.json
├─ .prettierrc
└─ README.md
```

---

## 🎮 How to Use

1. **Add Skill**  
   Click **Add New Skill** (or press Enter/Space when focused), fill **Name** and **Description** (required), optional **Cost**, then **Add Skill**.

2. **Connect Skills (Prerequisites)**  
   Drag a connection **from the bottom (source)** of a skill to the **top (target)** of another to define: **source → target** (meaning: “target depends on source”).

3. **Unlock / Lock Skills**  
   - Click (or press Enter/Space) on a node to **toggle**.  
   - Unlocking checks all **incoming** prerequisites are completed.  
   - **Locking** a node relocks **all dependents recursively**.

4. **Search**  
   - Type in the search bar to highlight nodes matching by name.  
   - **Edges** connected to any highlighted node also highlight (OR logic).

5. **Reset**  
   - Click **Clear** to wipe nodes & edges (and LocalStorage).  

---

## 🔍 Search & Highlight (with Debounce)

- Search input is debounced (e.g., 300ms) via `useDebounce`.
- `searchUtil` highlights:
  - Nodes whose `data.name` includes the search term (case-insensitive).
  - Edges where **either** endpoint node matches (so partial matches on one side still show edges).

If you test this behavior, either **advance Jest timers** or **mock debounce** to avoid flaky tests.

---

## 🔗 Edge Rules & Cycle Prevention

- Edges are created via React Flow `onConnect` handler, decorated with an arrow marker.
- On every candidate connect, we build a temp graph and pass it to `hasCycle()`:
  - Depth-first search using `visited` + recursion stack detects back edges.
  - If a cycle is detected, edge creation is **rejected** and a toast error is shown.

---

## ♿ Accessibility

- Top-level container and React Flow region use appropriate **ARIA roles** (e.g., `role="application"`, `role="region"`).
- Nodes are focusable and handle **Enter/Space** to toggle completed state.
- Dialog uses MUI’s accessible modal patterns.
- Labels for inputs, proper `aria-*` usage for error states in the form.

---

## 🎨 UI & Theming

- **MUI v5** components with `sx` styling.
- Dialog-driven add flow, polished buttons with hover & focus transitions.
- Optional particle background (non-blocking effect).

---

## 💾 Data Persistence

- Changes to nodes and edges are written to **LocalStorage** immediately (on `onNodesChange`, `onEdgesChange`, as well as on connect / add).
- Keys:
  - `SKILL_TREE_NODES`
  - `SKILL_TREE_EDGES`

---

## 🛠 Troubleshooting

- **Search highlight seems delayed** → This is due to debounce; allow 300ms or mock debounce in tests.
- **Edge not highlighting on partial matches** → Ensure `searchUtil` uses **OR logic** between source/target matches.
- **Cycle error on connect even when path looks okay** → Double-check direction (source → target). A → B and B → A is a cycle.
- **Jest “act(...)” warnings** → Wrap `user.click` or `user.type` in `act(...)` or mock MUI TouchRipple.
- **Timeouts in coverage run** → Increase Jest timeout or mock debounce / TouchRipple.

---


Please run:

```bash
npm run lint
npm run format
npm run test
```

before submitting.

---

## 🗺️ Roadmap

- Export/Import skill tree JSON
- Auto-layout with `dagre` (toggle in UI)
- Theming (dark/light system)
- Grouping / categories panel
- Node metadata badges (e.g., level, tags)

---

