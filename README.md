# Multiplayer Checkers Game

A fully functional and professional Multiplayer Checkers Game using Next.js, Firebase, and Tailwind CSS.

## Features

- **Real-time Multiplayer**: Play checkers with friends online in real-time
- **User Authentication**: Login with Google or Email/Password using Firebase Auth
- **Betting System**: Bet with virtual currency for more exciting gameplay
- **In-game Chat**: Chat with your opponent during the game
- **Responsive Design**: Play on desktop or mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, ShadCN UI
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel

## Setup Instructions

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google and Email/Password)
   - Create a Firestore database (start in test mode)
   - Register a web app in Project Settings
   - Copy the Firebase config

4. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the Firebase configuration values:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   
6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Connect your Vercel account to GitHub

3. Import the repository in Vercel

4. Add environment variables:
   - Add all the Firebase configuration variables from your `.env.local` file
   - You can set up different environments for production, preview, and development

5. Deploy!

## Project Structure

```
checkers-game/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── game/      # Local game route
│   │   ├── multiplayer/ # Multiplayer game routes
│   │   └── page.tsx   # Home page
│   ├── components/    # React components
│   │   ├── auth/      # Authentication components
│   │   ├── game/      # Game-related components
│   │   └── ui/        # ShadCN UI components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and libraries
│   └── types/         # TypeScript type definitions
├── .env.local         # Environment variables (not in git)
├── components.json    # ShadCN UI configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

## Firebase Firestore Structure

```
gameRooms/
├── [roomId]/
│   ├── blackPlayerId: string
│   ├── whitePlayerId: string | null
│   ├── status: 'waiting' | 'playing' | 'finished'
│   ├── currentTurn: 'black' | 'white'
│   ├── board: Array<Array<Piece | null>>
│   ├── createdAt: timestamp
│   ├── lastMoveAt: timestamp
│   ├── winner: 'black' | 'white' | null
│   └── betAmount: number

messages/
├── [messageId]/
│   ├── gameRoomId: string
│   ├── senderId: string
│   ├── senderName: string
│   ├── text: string
│   └── timestamp: timestamp
```

## License

MIT
