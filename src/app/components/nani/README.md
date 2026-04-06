# Nani Core Components

This directory contains core utility components and hooks for the WalletTrack application.

## Components

### ImageWithFallback
A robust image component with fallback handling for failed image loads.

**Usage:**
```tsx
import { ImageWithFallback } from './nani/ImageWithFallback';

<ImageWithFallback src="/path/to/image.jpg" alt="Description" />
```

### useKeyboardShortcuts Hook
Custom React hook for managing keyboard shortcuts throughout the application.

**Features:**
- Cross-platform support (Cmd on Mac, Ctrl on Windows/Linux)
- Modular callback system
- Prevents default browser behaviors

**Shortcuts:**
- `Cmd/Ctrl + N`: New Transaction
- `Cmd/Ctrl + D`: Toggle Dark Mode
- `Cmd/Ctrl + E`: Export JSON
- `Cmd/Ctrl + Shift + E`: Export CSV
- `Cmd/Ctrl + K`: Focus Search

**Usage:**
```tsx
import { useKeyboardShortcuts } from './nani/useKeyboardShortcuts';

useKeyboardShortcuts({
  onNewTransaction: () => console.log('New transaction'),
  onToggleTheme: () => console.log('Toggle theme'),
  // ... other callbacks
});
```

### BuildInfo
Application metadata and versioning information.

**Usage:**
```tsx
import { getBuildInfo, getFormattedVersion } from './nani/BuildInfo';

const version = getFormattedVersion(); // "v1.2.5 (build 20260406-0930)"
const info = getBuildInfo(); // Full build object
```

## Architecture

This modular structure ensures:
- Clean separation of concerns
- Reusable utilities across components
- Easy testing and maintenance
- Professional codebase organization

---

**Maintained by:** Nani Technologies  
**License:** Proprietary