import Login from "@/components/auth/Login";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Online Checkers</h1>
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <Login />
        <div className="w-full border-t border-gray-200 my-6"></div>
        <div className="text-center w-full">
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/game"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Play Local Game (Offline)
            </Link>
            <Link
              href="/multiplayer"
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Online Multiplayer
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
