# 3D Monitors Application

This project displays a 3D retro computer model using React, Three.js, and related libraries. It showcases dynamic screen content and optimized rendering techniques.

## Features

- Displays a complex 3D model (`computers_1-transformed.glb`).
- Uses React Three Fiber and Drei for efficient 3D scene management.
- Implements dynamic content rendering onto monitor screens.
- Includes performance optimizations like instancing and LOD (Level of Detail - planned).
- Configured for deployment on Vercel.

## Technology Stack

- React
- Three.js
- React Three Fiber (`@react-three/fiber`)
- React Three Drei (`@react-three/drei`)
- `pnpm` (Package Manager)
- Vercel (Deployment)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- `pnpm` (Package Manager - Installation recommended via `corepack enable`)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd monitors
    ```
2.  Install dependencies using `pnpm`:
    ```bash
    pnpm install
    ```
    _Note: `--legacy-peer-deps` might be needed initially if dependency conflicts arise, but `pnpm` often handles this better._

### Running the Development Server

To start the development server (usually on `http://localhost:3001`):

```bash
pnpm start
```

The application will automatically open in your default browser.

### Building for Production

To create an optimized production build (output in the `build/` directory, source maps disabled):

```bash
pnpm build
```

### Deployment

This project is configured for easy deployment to Vercel.

1.  Install the Vercel CLI:
    ```bash
    npm install -g vercel
    ```
2.  Deploy to a preview environment:
    ```bash
    pnpm deploy
    ```
3.  Deploy to production:
    ```bash
    pnpm deploy:prod
    ```

## Project Structure

Refer to `project-structure.md` for a detailed overview of the project's directory and file organization.

## Contributing

Contributions are welcome! Please follow standard Git workflow (fork, branch, commit, pull request).

## License

[Specify your license here, e.g., MIT License]
