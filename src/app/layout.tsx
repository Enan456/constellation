import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homelab Dashboard',
  description: 'Infrastructure topology and service management',
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
