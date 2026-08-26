# VOICEX AI - Enterprise SaaS Monorepo Foundation

A production-ready Turborepo monorepo architecture for an AI Voiceover and Neural Speech Synthesis platform. Built with Next.js 14+ (App Router), TypeScript (Strict Mode), Tailwind CSS, Headless UI, and Zustand.

---

## 🏗️ Monorepo Architecture

```
.
├── apps/
│   └── web/                     # Next.js 14+ App Router frontend application
│       ├── src/
│       │   ├── app/             # App router pages, layouts, globals.css
│       │   └── components/      # Application-specific UI, Header, Footer, Studio Demo
│       ├── next.config.mjs      # Transpilation for @saas/* monorepo packages
│       └── tailwind.config.ts   # Design tokens extended from @saas/tailwind-config
└── packages/
    ├── ui/                      # Shared zero-styled & themed headless UI component library
    │   └── src/components/      # Button, Input, Card, Container, Logo, Spinner, Badge, Portal
    ├── types/                   # Shared TypeScript domain definitions & contracts (No `any`)
    ├── core/                    # Shared API client, audio utilities, constants, Zustand stores
    ├── tsconfig/                # Strict base TypeScript configurations
    └── tailwind-config/         # Shared Tailwind design tokens & preset with CSS variable theme
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
npm install
```

### Development
```bash
# Run all apps and packages in watch mode
npm run dev

# Or run the Next.js app specifically
npm run dev --filter=web
```

### Type Checking & Linting
```bash
# Typecheck all packages in strict mode
npm run typecheck

# Lint all packages
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 🎨 Design System & Theming Tokens

The platform uses CSS variable-driven semantic tokens supporting instant dark/light mode switching:

| Token | Purpose |
|---|---|
| `--background` / `--foreground` | Main page canvas and high-contrast typography |
| `--primary` / `--primary-hover` | Electric acoustic indigo accent |
| `--accent` / `--accent-hover` | Neon violet/cyan secondary glow |
| `--card` / `--card-border` | Elevated surface layers with custom shadows |
| `--success` / `--destructive` | Semantic status and error states |

---

## 📦 Packages Overview

- **`@saas/ui`**: Accessible, modular UI atoms and molecules styled with custom Tailwind utility tokens (`Button`, `Input`, `Card`, `Container`, `Logo`, `Spinner`, `Badge`, `Portal`).
- **`@saas/types`**: Type-safe domain models for voice models, TTS synthesis requests, user quotas, projects, and standard API responses.
- **`@saas/core`**: Type-safe HTTP client with interceptors, audio calculation formatters, preset voice actor constants, and Zustand store (`useVoiceStudioStore`).
- **`apps/web`**: Next.js 14+ App Router frontend featuring a modern SaaS marketing landing page and an interactive Voice Studio sandbox.
