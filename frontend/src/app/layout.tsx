import type { ReactNode } from 'react';
import './globals.css';
import { WalletProvider } from '../components/WalletConnect';
import Footer from '../components/Footer';

export const metadata = {
  title: 'StacksRaise — Decentralized Block-Height Crowdfunding',
  description: 'Decentralized block-height crowdfunding secured by Bitcoin on Stacks Testnet',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#F8FAFC] text-[#0F172A]">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased">
        <WalletProvider>
          {children}
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}