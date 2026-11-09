import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'TamboPay | Everyday payments made easy', description: 'Airtime, data, electricity, cable TV, education and other bills. Direct checkout without a wallet.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
