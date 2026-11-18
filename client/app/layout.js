import './globals.css';

export const metadata = {
  title: 'Note-Taking App',
  description: 'A clean and secure full-stack note-taking application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
