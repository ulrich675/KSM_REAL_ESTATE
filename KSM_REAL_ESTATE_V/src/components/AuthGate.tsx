'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, User, Phone, MapPin } from 'lucide-react';

export default function AuthGate() {
    const { login, register } = useApp();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const [email, setEmail] = useState('');
    const [mdp, setMdp] = useState('');
    const [showMdp, setShowMdp] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [nom, setNom] = useState('');
    const [numero, setNumero] = useState('');
    const [adresse, setAdresse] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!email || !mdp) {
            setErrorMsg('Veuillez remplir tous les champs.');
            return;
        }
        const success = login(email, mdp);
        if (!success) {
            setErrorMsg('Identifiants invalides. Veuillez réessayer.');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!email || !mdp || !nom || !numero || !adresse) {
            setErrorMsg('Veuillez remplir tous les champs.');
            return;
        }
        const result = register({ nom, email, mdp, numero, adresse });
        if (!result.success) {
            setErrorMsg(result.message || 'Cet e-mail est déjà utilisé.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #0b0f19 100%)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.1)', filter: 'blur(80px)', top: '-10%', left: '-10%',
            }} />
            <div style={{
                position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(100px)', bottom: '-10%', right: '-10%',
            }} />
            <div style={{
                position: 'absolute', inset: 0, backgroundImage: 'url("/apartment_hero_bg.png")',
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12, pointerEvents: 'none',
            }} />

            <div className="glass-card animate-fade-in" style={{
                maxWidth: '460px', width: '100%', padding: '40px', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-premium)', background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative', zIndex: 10,
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', color: 'var(--text-white)', fontSize: '22px',
                        margin: '0 auto 16px auto', boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                    }}>
                        K
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-white)', fontSize: '26px', fontWeight: '800' }}>
                        KSM REAL ESTATE
                    </h2>
                    <p style={{ color: 'var(--text-gray)', fontSize: '13px', marginTop: '6px' }}>
                        Portail d&apos;Accès Immobilier du Cameroun
                    </p>
                </div>

                <div style={{ display: 'flex', marginBottom: '24px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', padding: '4px' }}>
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMsg(''); }}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)',
                            background: mode === 'login' ? 'var(--accent-orange)' : 'transparent',
                            color: mode === 'login' ? 'white' : 'var(--text-gray)',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        Se connecter
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setErrorMsg(''); }}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)',
                            background: mode === 'register' ? 'var(--accent-orange)' : 'transparent',
                            color: mode === 'register' ? 'white' : 'var(--text-gray)',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        S&apos;inscrire
                    </button>
                </div>

                <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {errorMsg && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <AlertTriangle size={16} />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {mode === 'register' && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="form-label" htmlFor="reg-nom">Nom complet</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                                    <input id="reg-nom" type="text" required placeholder="Ex: Jean Mballa" className="form-input"
                                        style={{ paddingLeft: '42px' }} value={nom} onChange={(e) => setNom(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="form-label" htmlFor="reg-numero">Numéro de téléphone</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                                    <input id="reg-numero" type="tel" required placeholder="Ex: 6XX XX XX XX" className="form-input"
                                        style={{ paddingLeft: '42px' }} value={numero} onChange={(e) => setNumero(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="form-label" htmlFor="reg-adresse">Adresse</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                                    <input id="reg-adresse" type="text" required placeholder="Ex: Bastos, Yaoundé" className="form-input"
                                        style={{ paddingLeft: '42px' }} value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="form-label" htmlFor="auth-email">Adresse e-mail</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                            <input id="auth-email" type="email" required placeholder="Ex: client@ksm.cm" className="form-input"
                                style={{ paddingLeft: '42px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="form-label" htmlFor="auth-mdp">Mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                            <input id="auth-mdp" type={showMdp ? 'text' : 'password'} required placeholder="Saisir le mot de passe"
                                className="form-input" style={{ paddingLeft: '42px', paddingRight: '40px' }}
                                value={mdp} onChange={(e) => setMdp(e.target.value)} />
                            <button type="button" onClick={() => setShowMdp(!showMdp)} style={{
                                position: 'absolute', right: '14px', top: '14px', background: 'transparent',
                                border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                            }}>
                                {showMdp ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" style={{
                        background: 'var(--accent-orange)', color: 'white', border: 'none', padding: '12px',
                        borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '10px',
                    }}>
                        {mode === 'login' ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>

                {mode === 'login' && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
                        <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Identifiants de démonstration
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-gray)' }}>
                                <span><strong>Client :</strong> client@ksm.cm</span><span style={{ color: 'var(--text-muted)' }}>client123</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-gray)' }}>
                                <span><strong>Propriétaire :</strong> ulrich@ksm.cm</span><span style={{ color: 'var(--text-muted)' }}>ulrich123</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-gray)' }}>
                                <span><strong>Admin :</strong> admin@ksm.cm</span><span style={{ color: 'var(--text-muted)' }}>admin123</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
