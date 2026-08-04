// Root layout — intentionally minimal.
// The real HTML shell (html, head, body, NextIntlClientProvider) is in /[locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
