import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Constellation',
  description: 'Visual infrastructure topology dashboard for homelab and cloud environments',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
