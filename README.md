# BrandLocus Admin

A Next.js admin dashboard application with Tailwind CSS and Framer Motion.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Animation library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

**Note:** If you encounter npm cache permission errors, fix npm cache permissions first:
```bash
sudo chown -R $(whoami) ~/.npm
```

Then install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
brandlocus_admin/
├── app/                # Next.js app directory
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles with Tailwind
├── public/            # Static assets
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript configuration
└── tailwind.config.ts # Tailwind configuration
```

## Features

- ✅ Next.js 16 with App Router
- ✅ TypeScript configured
- ✅ Tailwind CSS v4
- ✅ Framer Motion ready
- ✅ Modern development setup
