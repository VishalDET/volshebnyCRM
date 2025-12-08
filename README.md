# VolshebnyCRM - Travel Management System

A comprehensive travel CRM system built with React, Vite, Tailwind CSS, and Redux Toolkit.

## Features

- 📝 Query Management - Create, view, and manage travel queries
- 💰 Invoice Management - Client and supplier invoice tracking
- 🎫 Service Vouchers - Generate and manage service vouchers
- 💵 Finance Dashboard - Financial reports and analytics
- ⚙️ Master Data - Manage destinations, hotels, sightseeing, and rates
- 🔐 Authentication - Secure login and user management

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/VishalDET/volshebnyCRM.git
cd volshebnyCRM
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Start development server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/              # API service files
├── assets/           # Static assets
├── components/       # Reusable UI components
├── config/           # Configuration files
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── layouts/          # Layout components
├── pages/            # Page components
├── redux/            # Redux store and slices
├── routes/           # Route definitions
└── styles/           # Global styles
```

## License

MIT