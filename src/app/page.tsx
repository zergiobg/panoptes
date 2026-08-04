// This root page is only hit if the middleware fails to redirect.
// The middleware handles locale detection and redirects / → /es or /en
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/es');
}
