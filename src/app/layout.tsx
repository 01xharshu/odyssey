import "./globals.css";
import type { Metadata } from "next";
import WarningSuppressor from "@/components/WarningSuppressor";

export const metadata: Metadata = {
  title: "The Odyssey | An Interactive Cinematic Experience",
  description:
    "Journey through Homer's epic Odyssey in an immersive, scroll-driven cinematic experience with WebGL effects, dynamic characters, and spatial audio.",
  keywords: ["Odyssey", "Homer", "Greek mythology", "interactive", "WebGL", "cinematic"],
  openGraph: {
    title: "The Odyssey | An Interactive Cinematic Experience",
    description: "Journey through Homer's epic in an immersive scroll-driven experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#1c1c1e]">
        <WarningSuppressor />
        {children}
      </body>
    </html>
  );
}
