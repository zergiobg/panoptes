'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Replace current locale prefix in the path
    const segments = pathname.split('/');
    // segments[0] = '', segments[1] = locale, rest = the actual path
    segments[1] = newLocale;
    const newPath = segments.join('/');

    startTransition(() => {
      router.replace(newPath);
    });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '20px',
      padding: '3px',
      border: '1px solid rgba(255,255,255,0.1)',
      opacity: isPending ? 0.5 : 1,
      transition: 'opacity 0.2s'
    }}>
      {['es', 'en'].map((lang) => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          style={{
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: 'none',
            cursor: lang === locale ? 'default' : 'pointer',
            background: lang === locale ? 'var(--accent-main)' : 'transparent',
            color: lang === locale ? '#000' : 'var(--text-secondary)',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
