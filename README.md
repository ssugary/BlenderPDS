# BlenderPDS

A browser-based 3D modelling prototype built with [Three.js](https://threejs.org/). It is the first step of a collaborative 3D-modelling platform.

## Current capabilities

- Renders a Three.js scene with a grid and basic lighting.
- Creates green cube meshes.
- Provides orbit and walk camera navigation.
- Organises scene, rendering, input, and UI responsibilities into separate modules.

This is an early prototype. Object selection, translation, rotation, scaling, import/export, persistence, and collaboration are not implemented yet.

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/)
- The **Live Server** VS Code extension
- An internet connection

The current prototype imports Three.js version `0.185.1` from the unpkg CDN. Therefore, Node.js, npm, and a local `node_modules` folder are **not required to run the project at this stage**.

## Opening the project

1. Clone or download this repository.
2. Open the repository root (`BlenderPDS`) in VS Code.
3. Open `src/index.html`.
4. Right-click the file and select **Open with Live Server**. Alternatively, use the **Go Live** button in the VS Code status bar.
5. Live Server opens the prototype in your default browser. Saving a project file reloads the page automatically.

## Current controls

| Action | Control |
| --- | --- |
| Add a cube | Click **+ Cubo** |
| Toggle orbit/walk navigation | Click **Andar** |
| Look around in walk mode | Hold the left mouse button and move the mouse over the canvas |
| Move forward / left / right | `W` / `A` / `D` in walk mode |
| Move backward | `ArrowDown` in walk mode |
| Move up / down | `Space` / left `Shift` in walk mode |

The **Mover**, **Rotacionar**, and **Escalar** buttons, and the `G`, `R`, and `S` keys, are currently visual placeholders. They do not yet modify a selected object.

## Project structure

```text
src/
├── core/       # Scene, renderer, camera, input, and events
├── ui/         # Toolbar and viewport input
├── Main.js     # Application composition and cube creation
└── index.html  # Browser entry point
```

## Dependency note

`package.json` records Three.js version `0.185.1` for future npm-based tooling. The browser currently loads that same version directly from the CDN through the import map in `src/index.html`.

When the project later adopts a build tool such as Vite and React, contributors will run `npm install`; npm will then create `node_modules` locally from `package.json` and `package-lock.json`.

## Troubleshooting

- **Blank page or module-loading error:** make sure the page was opened using Live Server, not directly from the filesystem.
- **Three.js does not load:** verify the internet connection and that the unpkg CDN is reachable.
- **Changes do not appear:** save the edited file and refresh the browser, or stop and start Live Server again.
