import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI Note Service",
  description: "A note-taking service with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
