import "./globals.css";

export const metadata = {
  title: "Odyssey",
  description: "A premium Greek-themed interactive experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
