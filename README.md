# 🛡️ Privacy-First Toolbox

**Your Data. Your Device. No Compromises.**

A free, open-source collection of browser-based tools that process your files *entirely on your device*. No uploads. No servers. No tracking. Just powerful utilities that respect your privacy.

[![GitHub Stars](https://img.shields.io/github/stars/varundeva/privacy-first?style=social)](https://github.com/varundeva/privacy-first/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/varundeva/privacy-first/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/varundeva/privacy-first)](https://github.com/varundeva/privacy-first/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/varundeva/privacy-first)](https://github.com/varundeva/privacy-first/pulls)

---

## 🌟 Vision

**To build a world where privacy is the default, not a premium feature.**

We envision a future where every person has access to powerful, free tools that work entirely on their own devices - no data handed over to corporations, no hidden trackers, no compromises. Privacy-First Toolbox is our contribution to that future.

---

## 🎯 Mission

**Empower users with free, privacy-respecting online tools that process files entirely in the browser.**

Every day, millions of people upload sensitive documents to online converters without realizing their files might be stored, analyzed, or sold. We're here to change that. Our mission is to prove that powerful tools don't need your data.

---

## 💡 What We Believe In

| Value | Description |
|-------|-------------|
| 🔒 **Privacy First** | Your files never leave your device. All processing happens in your browser. |
| ⚡ **Fast & Efficient** | Modern Web Workers ensure smooth, non-blocking processing. |
| ❤️ **Free Forever** | No subscriptions, no hidden fees. Completely free to use. |
| 🔓 **Open Source** | Full transparency. Audit, contribute, and improve our codebase. |
| 🌍 **Community Driven** | Built by developers, for everyone. Your contributions shape the future. |

---

## 🛠️ Available Tool Categories

Privacy-First Toolbox offers **60+ tools** across 7 categories:

| Category | Description | Examples |
|----------|-------------|----------|
| 📸 **Image Tools** | Convert, compress, and manipulate images | JPG↔PNG, WebP conversion, Image resize |
| 📄 **PDF Tools** | Split, merge, and convert PDF files | PDF merge, split, compress, rotate |
| 📝 **Text Tools** | Text formatting, conversion, and analysis | Case converter, word counter, diff tool |
| 📅 **Date & Time** | Timestamp, formatting, and duration tools | Unix timestamp, timezone converter |
| 📊 **JSON Tools** | Format, validate, and convert JSON data | JSON formatter, JSON↔YAML, JSON↔CSV |
| 🔐 **Crypto & Security** | Hash generators, encryption, and encoding | MD5, SHA256, Base64, bcrypt |
| 🌐 **Web Tools** | Formatters, generators, and utilities | Color converter, CSS formatter, HTML encoder |

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org) | React framework with server components |
| [React 19](https://react.dev) | UI components and reactivity |
| [TypeScript](https://www.typescriptlang.org) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com) | Accessible UI primitives |
| [shadcn/ui](https://ui.shadcn.com) | Beautiful, reusable components |
| [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) | Off-main-thread processing |
| [pdf-lib](https://pdf-lib.js.org) | Client-side PDF manipulation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/varundeva/privacy-first.git
cd privacy-first

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 🤝 Contributing

We're building a community! Every contribution, big or small, helps make privacy-first tools accessible to everyone.

### Ways to Contribute

| Type | Description |
|------|-------------|
| 🐛 **Bug Reports** | Found a bug? [Open an issue](https://github.com/varundeva/privacy-first/issues/new) |
| 💡 **Feature Requests** | Have an idea? [Start a discussion](https://github.com/varundeva/privacy-first/discussions) |
| 🔧 **Code Contributions** | Submit a PR to add features or fix bugs |
| 📖 **Documentation** | Help improve docs and guides |
| 🌐 **Translations** | Help make tools accessible in more languages |
| 🎨 **Design** | Improve UI/UX with design suggestions |

### How to Contribute Code

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** following our coding standards
5. **Test** your changes locally
6. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** with a clear description

### Adding a New Tool

Want to add a new tool? Check out our detailed [Architecture Guide](./ARCHITECTURE.md) which covers:

1. Defining your tool in the registry (`lib/tools-config.ts`)
2. Creating the tool component
3. Registering in the client router
4. Adding worker logic (if needed)

**Quick Overview:**

```typescript
// 1. Add to lib/tools-config.ts
{
  id: 'your-tool-id',
  name: 'Your Tool Name',
  slug: 'your-tool-slug',
  category: 'image', // or 'pdf', 'text', 'json', 'crypto', 'web', 'date'
  // ... see existing tools for full structure
}

// 2. Create component in components/tools/[category]/YourTool.tsx
// 3. Register in app/tools/[category]/[slug]/client.tsx
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no code change |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `chore:` | Build/tooling changes |

---

## 📁 Project Structure

```
privacy-first/
├── app/                    # Next.js App Router pages
│   ├── tools/              # Tool pages (dynamic routing)
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   └── ...
├── components/
│   ├── tools/              # Tool-specific components
│   │   ├── image/          # Image tools
│   │   ├── pdf/            # PDF tools
│   │   ├── text/           # Text tools
│   │   ├── json/           # JSON tools
│   │   ├── crypto/         # Crypto tools
│   │   ├── web/            # Web tools
│   │   ├── date/           # Date/Time tools
│   │   └── shared/         # Shared tool components
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components
├── lib/
│   ├── workers/            # Web Workers for processing
│   ├── tools-config.ts     # Tool registry & SEO metadata
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── styles/                 # Global styles
```

---

## 🔒 How Privacy Works

### Zero Server Upload

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────────────────┐ │
│  │   Main Thread    │          │      Web Worker Thread       │ │
│  │                  │          │                              │ │
│  │  ┌────────────┐  │  ────►   │  ┌────────────────────────┐  │ │
│  │  │  Tool UI   │  │  File    │  │   Processing Logic     │  │ │
│  │  │ Component  │  │  Data    │  │                        │  │ │
│  │  └────────────┘  │          │  └────────────────────────┘  │ │
│  │        │         │          │            │                 │ │
│  │        ▼         │  ◄────   │            ▼                 │ │
│  │  ┌────────────┐  │ Result   │  ┌────────────────────────┐  │ │
│  │  │  Download  │  │          │  │  OffscreenCanvas API   │  │ │
│  │  │   Result   │  │          │  │  (stays in browser)    │  │ │
│  │  └────────────┘  │          │  └────────────────────────┘  │ │
│  │                  │          │                              │ │
│  └──────────────────┘          └──────────────────────────────┘ │
│                                                                  │
│                    NO DATA EVER LEAVES THIS BOX                  │
└─────────────────────────────────────────────────────────────────┘
```

### Browser APIs We Use

- **Web Workers** – Off-main-thread processing
- **OffscreenCanvas** – Image manipulation in workers
- **File API** – Local file handling
- **Blob/ArrayBuffer** – Binary data processing
- **URL.createObjectURL** – Preview generation

---

## 🗺️ Roadmap

We're constantly improving! Here's what's coming:

### 🔜 Short Term
- [ ] Batch processing for multiple files
- [ ] More image format support (TIFF, HEIC)
- [ ] Audio/Video tools category
- [ ] PWA support for offline usage

### 🎯 Medium Term
- [ ] Browser extension
- [ ] API for developers
- [ ] Internationalization (i18n)
- [ ] Mobile app (React Native)

### 🌟 Long Term
- [ ] AI-powered tools (running locally via WebML)
- [ ] Plugin system for community tools
- [ ] Desktop app (Electron/Tauri)

---

## 🙏 Credits & Acknowledgements

Privacy-First Toolbox is built on the shoulders of giants. We're grateful to:

- **Next.js** & **React** teams
- **Tailwind CSS** & **Radix UI** maintainers
- **pdf-lib** for amazing PDF processing
- All open-source contributors who make this possible

See our full [Credits Page](./app/credits/page.tsx) for a complete list.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Varun Deva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 💬 Community

Join our growing community of privacy advocates and developers!

- 🐙 [GitHub Discussions](https://github.com/varundeva/privacy-first/discussions)
- 🐛 [Issue Tracker](https://github.com/varundeva/privacy-first/issues)
- ⭐ [Star us on GitHub](https://github.com/varundeva/privacy-first)

---

## 🌟 Star History

If you find Privacy-First Toolbox useful, please consider giving us a ⭐ on GitHub!

Your support helps us reach more people and motivates continued development.

---

**Made with ❤️ for privacy by the open-source community**

[⭐ Star us on GitHub](https://github.com/varundeva/privacy-first) • [🐛 Report Bug](https://github.com/varundeva/privacy-first/issues/new) • [� Request Feature](https://github.com/varundeva/privacy-first/discussions)
