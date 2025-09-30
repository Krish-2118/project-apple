import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })


export const metadata: Metadata = {
  title: "IndiFarm AI",
  description: "AI-driven tools and data-driven insights for Indian farmers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
