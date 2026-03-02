# Frontend

## Overview

This is the frontend module of the microservices system. It provides the user interface and communicates with backend services through the API Gateway.

## Tech Stack

| Component        | Choice               |
|------------------|----------------------|
| Framework        | *(e.g., React, Vue, Angular, Svelte, plain HTML/JS)* |
| Styling          | *(e.g., CSS, Tailwind, Bootstrap, Material UI)*       |
| Package Manager  | *(e.g., npm, yarn, pnpm)*                             |
| Build Tool       | *(e.g., Vite, Webpack, esbuild)*                      |

## Getting Started

```bash
# From project root
docker compose up frontend --build

# Or run locally (adapt to your stack)
cd src/
# npm install && npm run dev
# yarn && yarn dev
```

## Project Structure

```
frontend/
├── Dockerfile
├── readme.md
└── src/           # Your source code goes here
```

## Environment Variables

| Variable       | Description                | Default                  |
|----------------|----------------------------|--------------------------|
| `API_BASE_URL` | URL of the API Gateway     | `http://localhost:8080`  |

## Build for Production

```bash
# Example:
# npm run build
# yarn build
```

## Notes

- All API calls should go through the **API Gateway** (`gateway`), not directly to individual services.
- Configure proxy or API base URL to point to the gateway.