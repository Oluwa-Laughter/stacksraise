import type { ReactNode } from 'react';
import './globals.css';
import { WalletProvider } from '../components/WalletConnect';
import Footer from '../components/Footer';

export const metadata = {
  title: 'StacksRaise — Decentralized Block-Height Crowdfunding',
  description: 'Decentralized block-height crowdfunding secured by Bitcoin on Stacks Testnet',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#F8FAFC] text-[#0F172A]">
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased">
        <WalletProvider>
          {children}
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}