'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, CheckCircle, XCircle, MapPin, Maximize2, BedDouble, Bath, Heart, Star, Scale } from 'lucide-react';
import Link from 'next/link';

const formatPrix = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';

export default function ComparePage() {
    const router = useRouter();
    const { biens, compareIds, toggleCompare, clearCompare } = useApp();

    const items = biens.filter(b => compareIds.includes(b.id));

    if (items.length === 0) {
        return (
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ marginBottom: 24 }}>
                    <Scale size={56} style={{ color: 'var(--accent-orange)', opacity: 0.6 }} />
                </div>
                <h1 style={{ fontSize: '30px', color: 'var(--text-white)', marginBottom: '12px', fontWeight: 800 }}>Aucun bien sélectionné</h1>
                <p style={{ color: 'var(--text-gray)', marginBottom: '32px' }}>
                    Retournez au catalogue et cochez des biens pour les comparer.
                </p>
                <button
                    onClick={() => router.push('/')}
                    style={{ padding: '12px 28px', background: 'var(--accent-orange)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                    <ArrowLeft size={18} /> Retour au catalogue
                </button>
            </div>
        );
    }

    // Features rows definition (label, accessor function)
    interface Feature {
        label: string;
        render: (b: any) => React.ReactNode;
        best?: 'min' | 'max' | null;
        getValue?: (b: any) => number;
    }
    const features: Feature[] = [
        {
            label: 'Prix',
            render: b => <strong style={{ color: 'var(--accent-orange)', fontSize: 18 }}>{formatPrix(b.prix)}</strong>,
            best: 'min',
            getValue: b => b.prix
        },
        {
            label: 'Catégorie',
            render: b => <span style={{ padding: '3px 10px', background: 'rgba(249,115,22,0.15)', borderRadius: 999, color: 'var(--accent-orange)', fontWeight: 600, fontSize: 13 }}>{b.categorie}</span>,
        },
        {
            label: 'État',
            render: b => b.etat === 'Disponible'
                ? <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} /> Disponible</span>
                : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}><XCircle size={16} /> Vendu</span>
        },
        {
            label: 'Superficie',
            render: b => <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Maximize2 size={15} color="var(--accent-orange)" />{b.superficie} m²</span>,
            best: 'max',
            getValue: b => b.superficie
        },
        {
            label: 'Chambres',
            render: b => <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BedDouble size={15} color="var(--accent-orange)" />{b.chambres}</span>,
            best: 'max',
            getValue: b => b.chambres
        },
        {
            label: 'Salles de bain',
            render: b => <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bath size={15} color="var(--accent-orange)" />{b.sallesDeBain}</span>,
            best: 'max',
            getValue: b => b.sallesDeBain
        },
        {
            label: 'Localisation',
            render: b => <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><MapPin size={15} color="var(--accent-orange)" />{b.localisation}</span>,
        },
        {
            label: 'Popularité',
            render: b => <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={15} color="#f97316" fill="#f97316" />{b.likes}</span>,
            best: 'max',
            getValue: b => b.likes
        },
        {
            label: 'Note moyenne',
            render: b => {
                const avg = b.commentaires.length > 0
                    ? (b.commentaires.reduce((s: number, c: any) => s + c.note, 0) / b.commentaires.length).toFixed(1)
                    : 'Aucun';
                return <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={15} color="#f59e0b" fill="#f59e0b" />{avg}</span>;
            }
        },
    ];

    // Compute best values for highlighting
    const bestMap: Record<string, Set<string>> = {};
    features.forEach(feat => {
        if (feat.best && feat.getValue) {
            const vals = items.map(b => ({ id: b.id, val: feat.getValue!(b) }));
            let bestVal = feat.best === 'min' ? Math.min(...vals.map(v => v.val)) : Math.max(...vals.map(v => v.val));
            bestMap[feat.label] = new Set(vals.filter(v => v.val === bestVal).map(v => v.id));
        }
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Scale size={32} style={{ color: 'var(--accent-orange)' }} />
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-white)', margin: 0 }}>Tableau Comparatif</h1>
                        <p style={{ color: 'var(--text-gray)', marginTop: 4, fontSize: 14 }}>{items.length} bien(s) sélectionné(s) • Surligné en vert = meilleur score</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={clearCompare} style={{ padding: '9px 18px', background: 'transparent', color: 'var(--text-gray)', border: '1px solid var(--border-color)', borderRadius: 8, fontWeight: '600', cursor: 'pointer' }}>
                        Vider tout
                    </button>
                    <button onClick={() => router.push('/')} style={{ padding: '9px 18px', background: 'var(--accent-orange)', color: 'white', border: 'none', borderRadius: 8, fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowLeft size={16} /> Retour
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${items.length * 200 + 200}px` }}>
                    <thead>
                        <tr style={{ background: 'rgba(249,115,22,0.08)', borderBottom: '2px solid var(--accent-orange)' }}>
                            <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-gray)', fontWeight: 700, width: 170, fontSize: 13, whiteSpace: 'nowrap' }}>
                                CARACTÉRISTIQUES
                            </th>
                            {items.map(bien => (
                                <th key={bien.id} style={{ padding: '16px 20px', textAlign: 'center', minWidth: 200 }}>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            title="Retirer du comparateur"
                                            onClick={() => toggleCompare(bien.id)}
                                            style={{ position: 'absolute', top: -8, right: -8, background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <XCircle size={15} />
                                        </button>
                                        <img src={bien.imageMain} alt={bien.nom} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />
                                        <div style={{ color: 'var(--text-white)', fontWeight: 700, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{bien.nom}</div>
                                        <Link href={`/properties/${bien.id}`} style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--accent-orange)', padding: '4px 12px', borderRadius: 999 }}>
                                            Voir détails →
                                        </Link>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feat, fi) => (
                            <tr key={fi} style={{ borderBottom: '1px solid var(--border-color)', background: fi % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                <td style={{ padding: '14px 20px', color: 'var(--text-gray)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', borderRight: '1px solid var(--border-color)' }}>
                                    {feat.label}
                                </td>
                                {items.map(bien => {
                                    const isBest = bestMap[feat.label]?.has(bien.id);
                                    return (
                                        <td key={bien.id} style={{
                                            padding: '14px 20px',
                                            textAlign: 'center',
                                            color: 'var(--text-white)',
                                            background: isBest ? 'rgba(34, 197, 94, 0.08)' : undefined,
                                            borderLeft: '1px solid var(--border-color)',
                                            transition: 'background 0.2s',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                                                {feat.render(bien)}
                                                {isBest && <span title="Meilleur" style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, marginLeft: 4 }}>✓</span>}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
