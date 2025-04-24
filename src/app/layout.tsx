"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { ServerHealthCheck } from "@/components/ui/ServerHealthCheck";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
        <title>JAI-VIER</title>
        <meta name="description" content="Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          {/* <ServerHealthCheck /> */}

        </AuthProvider>
      </body>
    </html>
  );
}