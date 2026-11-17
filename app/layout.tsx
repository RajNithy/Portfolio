import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio | Raj Kumar",
  description: "Video editing, graphic design and creative work by Raj Kumar.",
  metadataBase: new URL("https://raak-editz.vercel.app"),
  openGraph: {
    title: "Portfolio | Raj Kumar",
    description: "Video editing • Graphic design • Creative direction",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
