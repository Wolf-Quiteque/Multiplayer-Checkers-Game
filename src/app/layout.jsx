import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BettingProvider } from '@/context/BettingContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Online Multiplayer Checkers",
  description: "Play Checkers online with friends - bet, chat, and have fun!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BettingProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </BettingProvider>
      </body>
    </html>
  );
}
