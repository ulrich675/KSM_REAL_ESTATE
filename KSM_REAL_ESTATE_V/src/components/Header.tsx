'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Home, Compass, BarChart, User, Users, ShieldAlert, Sun, Moon, Scale } from 'lucide-react';

export default function Header() {
    const { currentUser, logout, compareIds, visitesEnAttenteCount, theme, toggleTheme } = useApp();
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Accueil', icon: Home },
        { href: '/#catalogue-sec', label: 'Catalogue', icon: Compass },
        { href: '/dashboard', label: 'Espace Dashboard', icon: BarChart },
    ];

    return (
        <header className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            borderBottom: '1px solid var(--border-color)',
        }}>
            {/* Logo */}
            <Link href="/" id="ksm-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    color: 'var(--text-white)',
                    fontSize: '18px',
                }}>
                    K
                </div>
                <span style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '22px',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    KSM <span style={{ color: 'var(--accent-orange)' }}>REAL ESTATE</span>
                </span>
            </Link>

            {/* Nav Menu */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href.startsWith('#') && pathname === '/');
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            id={`nav-link-${link.label.toLowerCase()}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: isActive ? 'var(--accent-orange)' : 'var(--text-gray)',
                                fontSize: '15px',
                                fontWeight: '500',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'color 0.2s, background 0.2s',
                            }}
                        >
                            <Icon size={18} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}

                {/* Compare count indicator */}
                {compareIds.length > 0 && (
                    <Link
                        href="/#comparateur-sec"
                        id="nav-link-compare"
                        style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-purple)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Scale size={16} /> Comparer ({compareIds.length})
                    </Link>
                )}
            </nav>

            {/* Auth controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-gray)',
                        padding: '8px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                    }}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {currentUser ? (
                    <>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255, 255, 255, 0.03)', padding: '6px 12px',
                            borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)',
                        }}>
                            {currentUser.role === 'client' && <User size={16} style={{ color: 'var(--accent-purple)' }} />}
                            {currentUser.role === 'proprietaire' && <Users size={16} style={{ color: 'var(--accent-orange)' }} />}
                            {currentUser.role === 'admin' && <ShieldAlert size={16} style={{ color: '#ef4444' }} />}
                            <span style={{ fontSize: '13px', color: 'var(--text-white)', fontWeight: 600 }}>{currentUser.nom}</span>
                        </div>

                        <Link href="/dashboard" id="btn-goto-dashboard" style={{
                            background: 'var(--accent-orange)', color: 'var(--text-white)', padding: '10px 20px',
                            borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '14px',
                            textDecoration: 'none',
                        }}>
                            {currentUser.role === 'client' ? 'Mon Espace' : currentUser.role === 'proprietaire' ? 'Gérer mes biens' : 'Administration'}
                            {visitesEnAttenteCount > 0 && currentUser.role === 'proprietaire' ? ` (${visitesEnAttenteCount})` : ''}
                        </Link>

                        <button
                            id="btn-logout"
                            onClick={logout}
                            style={{
                                background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-gray)',
                                padding: '10px 18px', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            }}
                        >
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <Link href="/connexion" id="btn-login" style={{
                        background: 'var(--accent-orange)', color: 'var(--text-white)', padding: '10px 20px',
                        borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '14px',
                        textDecoration: 'none',
                    }}>
                        Se connecter
                    </Link>
                )}
            </div>
        </header>
    );
}