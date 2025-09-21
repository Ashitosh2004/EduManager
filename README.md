# EduManager - Institute Management System

A comprehensive React.js application designed to streamline management operations for educational institutions with Firebase backend services.

## Features

- **Student Management**: Complete student information system
- **Faculty Management**: Faculty profiles and assignments
- **Course Management**: Course creation and management
- **Timetable Generation**: Intelligent timetable generation with conflict detection
- **Real-time Notifications**: Firebase Cloud Messaging integration
- **Role-based Access Control**: Secure authentication system
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and build
- Tailwind CSS for styling
- Wouter for routing
- React Hook Form with Zod validation
- TanStack Query for state management

### Backend
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- Firebase Authentication
- Firebase Firestore
- Session management

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ashitosh2004/EduManager.git
cd EduManager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in your database and Firebase configuration in the `.env` file.

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Deployment

### Vercel Deployment

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables

Set these in your Vercel dashboard:

- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: PostgreSQL direct connection string  
- `FIREBASE_API_KEY`: Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Firebase app ID
- `SESSION_SECRET`: Session secret key

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run vercel-build` - Build for Vercel deployment
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── index.html
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
└── dist/                 # Build output
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT License - see LICENSE file for details
