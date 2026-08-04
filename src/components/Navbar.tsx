'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Map, LogIn, Briefcase, Plus, Shield, Bell } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (isAdmin) checkPendingApprovals();
  }, [isAdmin]);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.loggedIn) {
        setCurrentUser(data.user);
        setIsAdmin(data.isAdmin);
      }
    } catch (e) {}
  };

  const checkPendingApprovals = async () => {
    try {
      const res = await fetch('/api/admin/reports/pending');
      const data = await res.json();
      if (data.success && data.reports) {
        setPendingApprovals(data.reports.length);
      }
    } catch (e) {}
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px 30px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(15, 17, 21, 0.75)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentUser ? (
          <Link href={`/${locale}/perfil`} style={{ textDecoration: 'none' }}>
            {currentUser?.photoUrl && !currentUser.photoUrl.startsWith('pending') ? (
              <img src={currentUser.photoUrl} alt={currentUser.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-main)', cursor: 'pointer' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-main), #ffcc00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '1.2rem', cursor: 'pointer' }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        ) : (
          <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-main), #ffcc00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '1.2rem' }}>
              P
            </div>
          </Link>
        )}
        <Link href={`/${locale}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.5px' }} className="hide-on-mobile">Panoptes</span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="mobile-nav-gap" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href={`/${locale}/notificaciones`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
          <Bell size={16} /> <span className="hide-on-mobile">{t('nav.notifications')}</span>
        </Link>
        <Link href={`/${locale}/mi-actividad`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
          <Briefcase size={16} /> <span className="hide-on-mobile">{t('nav.activity')}</span>
        </Link>
        <Link href={`/${locale}/map`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
          <Map size={16} /> <span className="hide-on-mobile">{t('nav.map')}</span>
        </Link>

        {isAdmin && (
          <Link href={`/${locale}/admin`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none', position: 'relative' }}>
            <Shield size={16} />
            <span className="hide-on-mobile">{t('nav.admin')}</span>
            {pendingApprovals > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                background: '#ff3333', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px rgba(255,51,51,0.6)'
              }}>
                {pendingApprovals > 9 ? '9+' : pendingApprovals}
              </span>
            )}
          </Link>
        )}

        {!currentUser && (
          <>
            <Link href={`/${locale}/login`} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              <LogIn size={16} /> <span className="hide-on-mobile">{t('nav.login')}</span>
            </Link>
            <Link href={`/${locale}/register`} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              {t('nav.join')}
            </Link>
          </>
        )}

        {/* Language Switcher — always visible */}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
