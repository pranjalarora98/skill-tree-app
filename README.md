# 🌳 Skill Tree App

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)  
[![React Flow](https://img.shields.io/badge/React%20Flow-@xyflow%2Freact-blueviolet)](https://reactflow.dev/)  
[![ESLint](https://img.shields.io/badge/Linting-ESLint-4B32C3?logo=eslint)](https://eslint.org/)  
[![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-f7b93e?logo=prettier)](https://prettier.io/)  
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest)](https://jestjs.io/)  

A visual **Skill Tree Builder** built with React and [React Flow](https://reactflow.dev/).  
It allows users to create, connect, and unlock skills in a game-like tree structure.  
The app is fully keyboard accessible, tested with Jest, and follows code quality standards with ESLint and Prettier.

---

## ✨ Features

- 🎨 Interactive **skill nodes** (name, description, cost/level).  
- ➕ Add new skills via a **modal form**.  
- 🔗 Connect nodes to define prerequisites.  
- 🔓 Unlock / lock skills with prerequisite validation.  
- ♿ **Accessibility first**:  
  - ARIA roles and labels  
  - Keyboard navigation (Enter/Space to toggle, Escape to close modals)  
- 💾 Data persistence using **localStorage**.  
- ✅ Code quality enforced with **ESLint + Prettier**.  
- 🧪 Unit tested with **Jest + React Testing Library**.  

---

## 🚀 Getting Started

### Prerequisites
- React-flow Library
- Node.js (>= 20.x recommended)
- npm

### Installation
```bash
git clone https://pranjalarora98/skill-tree-app.git
cd skill-tree-app
npm install
```

### Testing
```
npm run test
npm run test:coverage
```

# Generates a coverage report in the coverage/ folder

### Formatting
```
npm run format
npm run lint
```