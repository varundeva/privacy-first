# Multi-Tool Platform Architecture

## Overview

This is a privacy-first, browser-based toolbox that processes files entirely on the client side. No data ever leaves the user's device.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────────────────┐ │
│  │   Main Thread    │          │      Web Worker Thread       │ │
│  │                  │          │                              │ │
│  │  ┌────────────┐  │  ────►   │  ┌────────────────────────┐  │ │
│  │  │  Tool UI   │  │  File    │  │   Processing Logic     │  │ │
│  │  │ Component  │  │  Data    │  │   (image.worker.ts)    │  │ │
│  │  └────────────┘  │          │  └────────────────────────┘  │ │
│  │        │         │          │            │                 │ │
│  │        ▼         │  ◄────   │            ▼                 │ │
│  │  ┌────────────┐  │ Progress │  ┌────────────────────────┐  │ │
│  │  │  Results   │  │  Result  │  │  OffscreenCanvas API   │  │ │
│  │  │  Preview   │  │          │  │  (no main thread)      │  │ │
│  │  └────────────┘  │          │  └────────────────────────┘  │ │
│  │                  │          │                              │ │
│  └──────────────────┘          └──────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
multi-tool-platform/
├── app/
│   ├── tools/
│   │   └── [category]/
│   │       └── [slug]/
│   │           ├── page.tsx      # Server component (metadata)
│   │           └── client.tsx    # Client component (tool mapping)
│   ├── home-client.tsx           # Homepage with tool grid
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── tools/
│   │   ├── shared/               # Shared tool components
│   │   │   ├── ProcessingStatus.tsx
│   │   │   ├── ResultPreview.tsx
│   │   │   └── index.ts
│   │   ├── image/                # Image tool components
│   │   │   ├── JpgToPngConverter.tsx
│   │   │   └── index.ts
│   │   ├── ToolShell.tsx         # Tool page container
│   │   ├── ToolHeader.tsx
│   │   ├── FileUploader.tsx
│   │   └── DownloadCard.tsx
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── workers/                  # Web Workers for processing
│   │   ├── types.ts              # Shared TypeScript types
│   │   ├── image.worker.ts       # Image processing worker
│   │   ├── worker-manager.ts     # Worker lifecycle & API
│   │   └── index.ts
│   ├── tools-config.ts           # Tool registry
│   └── utils.ts
│
└── public/
```

## Adding a New Tool

### 1. Define the Tool in Registry

Edit `lib/tools-config.ts`:

```typescript
export const toolsConfig: Tool[] = [
  // ... existing tools
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert PNG images to JPG format',
    longDescription: 'Convert PNG images to JPG format with adjustable quality.',
    keywords: ['png', 'jpg', 'convert'],
    icon: 'Image',
    componentPath: '@/components/tools/image/PngToJpgConverter',
    acceptedFormats: ['.png'],
    maxFileSize: 50,
  },
];
```

### 2. Create the Tool Component

Create `components/tools/image/PngToJpgConverter.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { convertImage } from '@/lib/workers';
// ... rest of component
```

### 3. Register in Client Router

Edit `app/tools/[category]/[slug]/client.tsx`:

```typescript
switch (toolId) {
  case 'jpg-to-png':
    return <JpgToPngConverter file={file} onReset={onReset} />;
  case 'png-to-jpg':
    return <PngToJpgConverter file={file} onReset={onReset} />;
  // ...
}
```

### 4. (Optional) Add Worker Logic

If your tool needs different processing logic, create a new worker or extend the existing one in `lib/workers/`.

## Key Design Principles

1. **Privacy First**: All processing happens in the browser. No server calls.

2. **Non-Blocking**: Heavy operations run in Web Workers to keep UI responsive.

3. **Separation of Concerns**:
   - UI components handle display only
   - Workers handle processing logic
   - Config defines tool metadata

4. **Easy Extension**: Adding new tools requires minimal code changes.

5. **Type Safety**: Full TypeScript throughout, including worker messages.

## Worker Communication

Workers use a message-based protocol:

```typescript
// Send to worker
{ type: 'convert', id: 'msg_123', payload: { ... } }

// Receive from worker
{ type: 'progress', id: 'msg_123', progress: { percent: 50, stage: 'processing' } }
{ type: 'success', id: 'msg_123', result: { ... } }
{ type: 'error', id: 'msg_123', error: 'Something went wrong' }
```

## Browser APIs Used

- **Web Workers**: Off-main-thread processing
- **OffscreenCanvas**: Image manipulation in workers
- **createImageBitmap**: Efficient image decoding
- **Blob/ArrayBuffer**: Binary data handling
- **URL.createObjectURL**: Preview generation
