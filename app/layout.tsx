import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raak Editz — Visuals That Make an Impact",
  description: "Video editing, graphic design and creative visuals by Raak Editz.",
  metadataBase: new URL("https://raak-editz.vercel.app"),
  openGraph: {
    title: "Raak Editz — Visuals That Make an Impact",
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
