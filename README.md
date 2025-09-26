# DSS Crypto Virtual Lab (ReactJS)

## Overview
A **frontend-only ReactJS app** to experiment with the **Digital Signature Standard (DSS / DSA)**.  
Generate keys, sign messages, verify signatures, and explore edge cases — all in the browser.

## Features
- **Key Generation**: Generate DSS parameters (`p`, `q`, `g`) and key pair (`x`, `y`).  
- **Message Signing**: Input messages and generate `(r, s)` signatures.  
- **Signature Verification**: Verify signatures and detect tampered messages.  
- **Edge Case Demonstration**: Handles reused `k`, `r=0`/`s=0`, invalid inputs, large messages.  
- **Light/Dark Mode**: Toggle theme using provided color palette.

## Components
- `KeyGen` – Generate keys  
- `Sign` – Sign messages  
- `Verify` – Verify signatures  
- `EdgeCases` – Explore invalid scenarios  
- `ThemeToggle` – Switch light/dark mode

## Tech Stack

- `React 18` – UI library
- `Vite 5` – Fast build tool & dev server
- `Tailwind CSS` – Styling
- `Lucide Icons` – For clean icons
- `Framer Motion` – For smooth animations

## Clone Repository
git clone https://github.com/your-username/dss-virtual-lab.git
cd dss-virtual-lab
## Install packages
npm install
## Run the app
npm run dev

