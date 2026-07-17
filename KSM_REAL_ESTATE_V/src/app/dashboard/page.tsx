'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useApp } from '../../context/AppContext';
import { Bien, ImagesPieces } from '../../data/properties';
import { fileToBase64 } from '../../utils/fileUtils';
import { apiService } from '../../services/api';
import Link from 'next/link';
import {
    Home, Plus, Edit2, Trash2, Check, X, Users, ShieldAlert,
    Package, Eye, Video, MapPin, Calendar, User, ChevronDown, ChevronUp, Image as ImageIcon, Camera
} from 'lucide-react';
import VirtualTourUploadModal from '../../components/VirtualTourUploadModal';

/**
 * Tente d'uploader un fichier image via le backend (file-core).
 * Retourne l'URL du fichier distant, ou le fallback base64 local.
 */
async function uploadOrBase64(file: File, tierId: string): Promise<string> {
    try {
        const result = await apiService.uploadFile(file, tierId, 'PROPERTY_IMAGE', file.name);
        if (result?.fileUrl) return result.fileUrl;
        // si le backend retourne un id mais pas d'URL directe, on garde le base64
    } catch (e) {
        console.warn('[KSM] upload échoué, fallback base64:', e);
    }
    return fileToBase64(file);
}

const formatPrix = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';

// ─────────────────────────────────────────────
// CLIENT DASHBOARD CONTENT (REUSABLE)
// ─────────────────────────────────────────────
interface ClientDashboardContentProps {
    showDevenirProp?: boolean;
}
export function ClientDashboardContent({ showDevenirProp = false }: ClientDashboardContentProps) {
    const { currentUser, achats, biens } = useApp();
    const [isProprietaireModalOpen, setProprietaireModalOpen] = useState(false);
    const mesAchats = achats.filter(a => a.clientId === currentUser?.id && !a.typeVisite);
    const mesVisitesVirt = achats.filter(a => a.clientId === currentUser?.id && a.typeVisite === 'virtuelle');
    const mesVisitesPhys = achats.filter(a => a.clientId === currentUser?.id && a.typeVisite === 'physique');

    const getBien = (id: string) => biens.find(b => b.id === id);

    const badgeStatut = (s?: string) => {
        const colors: Record<string, string> = {
            'En attente': '#f59e0b',
            'Confirmée': '#22c55e',
            'Refusée': '#ef4444',
        };
        return (
            <span style={{
                background: `${colors[s || 'En attente']}22`,
                color: colors[s || 'En attente'],
                padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
            }}>{s || 'En attente'}</span>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
                {[
                    { label: 'Biens achetés', value: mesAchats.length, icon: <Package size={20} /> },
                    { label: 'Visites virtuelles', value: mesVisitesVirt.length, icon: <Video size={20} /> },
                    { label: 'Visites physiques', value: mesVisitesPhys.length, icon: <MapPin size={20} /> },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: 'var(--accent-orange)' }}>{s.icon}</div>
                        <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-white)' }}>{s.value}</p>
                        <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Historique achats */}
            <Section title="Mes achats de biens">
                {mesAchats.length === 0 ? <Empty msg="Aucun achat pour l'instant." /> :
                    mesAchats.map(a => {
                        const b = getBien(a.bienId);
                        return b ? (
                            <HistoRow key={a.id}
                                image={b.imageMain} title={b.nom}
                                sub={`Localisation : ${b.localisation}`}
                                right={<><span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{formatPrix(a.montant)}</span><br /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.date}</span></>}
                            />
                        ) : null;
                    })}
            </Section>

            {/* Historique visites virtuelles */}
            <Section title="Mes visites virtuelles">
                {mesVisitesVirt.length === 0 ? <Empty msg="Aucune visite virtuelle." /> :
                    mesVisitesVirt.map(a => {
                        const b = getBien(a.bienId);
                        return b ? (
                            <HistoRow key={a.id}
                                image={b.imageMain} title={b.nom}
                                sub={`Visite virtuelle`}
                                right={<span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{a.montant === 0 ? 'GRATUIT' : formatPrix(a.montant)}</span>}
                            />
                        ) : null;
                    })}
            </Section>

            {/* Historique visites physiques */}
            <Section title="Mes visites physiques">
                {mesVisitesPhys.length === 0 ? <Empty msg="Aucune visite physique demandée." /> :
                    mesVisitesPhys.map(a => {
                        const b = getBien(a.bienId);
                        return b ? (
                            <HistoRow key={a.id}
                                image={b.imageMain} title={b.nom}
                                sub={`Date souhaitée : ${a.dateVisite}`}
                                right={badgeStatut(a.statusVisite)}
                            />
                        ) : null;
                    })}
            </Section>

            {/* Devenir Propriétaire - Bouton Modal */}
            {showDevenirProp && currentUser?.role === 'client' && (
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => setProprietaireModalOpen(true)} className="glass-card" style={{ padding: '16px 36px', fontSize: '16px', background: 'var(--accent-orange)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)', fontWeight: 600 }}>
                        🚀 Poser ma candidature PRO
                    </button>
                </div>
            )}

            {isProprietaireModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-card" style={{ background: '#1c1c1e', padding: '32px', maxWidth: '600px', width: '90%', borderRadius: '16px', position: 'relative' }}>
                        <button onClick={() => setProprietaireModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'white' }}>Devenir Propriétaire KSM</h2>
                        <DevenirPropForm onClose={() => setProprietaireModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// FORMULAIRE DE CANDIDATURE "DEVENIR PROPRIÉTAIRE"
// ─────────────────────────────────────────────
function DevenirPropForm({ onClose }: { onClose?: () => void }) {
    const { currentUser, pendingProprietorRequests, demanderDevenirProprietaire } = useApp();
    const [form, setForm] = useState({ numero: '', adresse: '', motivation: '' });
    const [submitted, setSubmitted] = useState(false);

    if (!currentUser) return null;
    const isPending = pendingProprietorRequests.includes(currentUser.id);

    if (isPending) {
        return (
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308' }}>
                <p style={{ fontWeight: 700, marginBottom: '6px' }}>⏳ Demande en attente</p>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Votre candidature a été soumise. Un administrateur l'examinera dans les plus brefs délais.</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                <p style={{ fontWeight: 700, marginBottom: '6px' }}>✅ Soumission réussie</p>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Votre demande a été envoyée avec succès à l'administration.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.numero || !form.adresse || !form.motivation.trim()) return;

        try {
            const userId = parseInt(String(currentUser.id).replace(/\D/g, '')) || 1;
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
            await fetch(`${API_BASE_URL}/users/${userId}/request-proprietor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('ksm_token')}`
                },
                body: JSON.stringify({
                    phoneNumber: form.numero,
                    physicalAddress: form.adresse,
                    motivation: form.motivation
                })
            });
            demanderDevenirProprietaire(currentUser.id);
            setSubmitted(true);
        } catch (err) {
            console.error("Erreur lors de la demande professionnel:", err);
        }
    };

    const inputStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: 'var(--text-white)',
        fontSize: '14px',
        width: '100%'
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Nom complet</label>
                    <input type="text" value={currentUser.nom} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Adresse email</label>
                    <input type="text" value={currentUser.email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Téléphone / WhatsApp</label>
                    <input type="text" required placeholder="Ex: +237 6XX XX XX XX" value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Adresse physique</label>
                    <input type="text" required placeholder="Ex: Bastos, Yaoundé" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} style={inputStyle} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Motivation / Descriptions des biens</label>
                <textarea rows={3} required placeholder="Décrivez les biens immobiliers que vous comptez proposer sur la plateforme ou vos motivations..." value={form.motivation} onChange={e => setForm(f => ({ ...f, motivation: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="submit" style={{ padding: '10px 24px', background: 'var(--accent-orange)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                    Soumettre la demande
                </button>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────
// CLIENT DASHBOARD WRAPPER
// ─────────────────────────────────────────────
function ClientDashboard() {
    return <ClientDashboardContent showDevenirProp={true} />;
}

// ─────────────────────────────────────────────
// PROPRIÉTAIRE DASHBOARD
// ─────────────────────────────────────────────
function ProprietaireDashboard() {
    const { currentUser, biens, achats, ajouterBien, modifierBien, supprimerBien, validerVisite } = useApp();
    const mesBiens = biens.filter(b => b.proprietaireId === currentUser?.id);
    const biensDisponibles = mesBiens.filter(b => b.etat === 'Disponible');
    const biensVendus = mesBiens.filter(b => b.etat === 'Acheté');
    const mesVisitesDemandees = achats.filter(
        a => a.typeVisite === 'physique' && mesBiens.some(b => b.id === a.bienId)
    );

    const [editingBien, setEditingBien] = useState<Bien | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeSection, setActiveSection] = useState<'client' | 'biens' | 'visites' | 'vendus'>('client');
    const [vtUploadBien, setVtUploadBien] = useState<{ id: string, numId: number } | null>(null);

    // Form state
    const [form, setForm] = useState({
        nom: '', categorie: 'Villa' as Bien['categorie'], description: '', prix: 0,
        localisation: '', superficie: 0, chambres: 0, sallesDeBain: 0,
        imageMain: '', latitude: 0, longitude: 0, imagesPieces: [] as ImagesPieces[]
    });

    const resetForm = () => setForm({
        nom: '', categorie: 'Villa', description: '', prix: 0,
        localisation: '', superficie: 0, chambres: 0, sallesDeBain: 0,
        imageMain: '', latitude: 0, longitude: 0, imagesPieces: []
    });

    const startEdit = (b: Bien) => {
        setEditingBien(b);
        setForm({
            nom: b.nom, categorie: b.categorie, description: b.description, prix: b.prix,
            localisation: b.localisation, superficie: b.superficie, chambres: b.chambres,
            sallesDeBain: b.sallesDeBain, imageMain: b.imageMain, latitude: b.latitude, longitude: b.longitude,
            imagesPieces: b.imagesPieces || []
        });
        setShowAddForm(false);
    };

    const handleSave = async () => {
        if (!form.nom || !form.description || !form.localisation || !form.prix || !currentUser) return;
        if (editingBien) {
            await modifierBien({ ...editingBien, ...form });
            setEditingBien(null);
        } else {
            await ajouterBien({
                id: `bien-${Date.now()}`,
                ...form,
                proprietaireId: currentUser.id,
            });
            setShowAddForm(false);
        }
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer ce bien ?')) await supprimerBien(id);
    };

    const navBtn = (key: typeof activeSection, label: string) => (
        <button
            onClick={() => setActiveSection(key)}
            style={{
                padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)',
                background: activeSection === key ? 'var(--accent-orange)' : 'rgba(255,255,255,0.04)',
                color: activeSection === key ? '#fff' : 'var(--text-gray)',
                fontWeight: 600, cursor: 'pointer', fontSize: '14px',
            }}
        >{label}</button>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Section Nav */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                {navBtn('client', '👤 Espace Client')}
                {navBtn('biens', ` Mes biens (${biensDisponibles.length})`)}
                {navBtn('visites', ` Visites (${mesVisitesDemandees.filter(v => v.statusVisite === 'En attente').length})`)}
                {navBtn('vendus', ` Biens vendus (${biensVendus.length})`)}
            </div>

            {/* ── CLIENT SIDE INHERITANCE */}
            {activeSection === 'client' && (
                <ClientDashboardContent showDevenirProp={false} />
            )}

            {/* Stats */}
            {activeSection !== 'client' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
                    {[
                        { label: 'Biens disponibles', value: biensDisponibles.length, icon: <Home size={20} /> },
                        { label: 'Biens vendus', value: biensVendus.length, icon: <Package size={20} /> },
                        { label: 'Visites en attente', value: mesVisitesDemandees.filter(v => v.statusVisite === 'En attente').length, icon: <Calendar size={20} /> },
                    ].map(s => (
                        <div key={s.label} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ color: 'var(--accent-orange)' }}>{s.icon}</div>
                            <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-white)' }}>{s.value}</p>
                            <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MES BIENS DISPONIBLES */}
            {activeSection === 'biens' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ color: 'var(--text-white)', fontWeight: 700 }}>Mes biens disponibles</h3>
                        <button
                            onClick={() => { setShowAddForm(!showAddForm); setEditingBien(null); resetForm(); }}
                            style={{
                                background: 'var(--accent-orange)', color: '#fff', border: 'none',
                                borderRadius: 'var(--radius-md)', padding: '10px 20px',
                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            <Plus size={16} /> Ajouter un bien
                        </button>
                    </div>

                    {/* Add/Edit Form */}
                    {(showAddForm || editingBien) && (
                        <BienForm
                            form={form} setForm={setForm}
                            onSave={handleSave}
                            onCancel={() => { setEditingBien(null); setShowAddForm(false); resetForm(); }}
                            isEdit={!!editingBien}
                        />
                    )}

                    {biensDisponibles.length === 0 ? <Empty msg="Aucun bien disponible. Ajoutez votre premier bien !" /> :
                        biensDisponibles.map(b => (
                            <div key={b.id} className="glass-card" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
                                <img src={b.imageMain} alt={b.nom} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'var(--text-white)', fontWeight: 700 }}>{b.nom}</p>
                                    <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{b.localisation} · {formatPrix(b.prix)}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.superficie}m² · {b.chambres} ch · ♥ {b.likes}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/properties/${b.id}`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-gray)', padding: '8px', borderRadius: 8, display: 'flex' }}>
                                        <Eye size={16} />
                                    </Link>
                                    <button onClick={() => setVtUploadBien({ id: b.id, numId: parseInt(b.id.replace('bien-', '')) || Date.now() })} style={{ background: 'rgba(14,165,233,0.15)', border: 'none', color: '#0ea5e9', padding: '8px', borderRadius: 8, cursor: 'pointer' }} title="Visite Virtuelle 360°">
                                        <Camera size={16} />
                                    </button>
                                    <button onClick={() => startEdit(b)} style={{ background: 'rgba(99,102,241,0.15)', border: 'none', color: '#818cf8', padding: '8px', borderRadius: 8, cursor: 'pointer' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(b.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: 8, cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                    {vtUploadBien && (
                        <VirtualTourUploadModal
                            bienId={vtUploadBien.id}
                            numericId={vtUploadBien.numId}
                            onClose={() => setVtUploadBien(null)}
                            onSuccess={() => {
                                alert('Visite virtuelle 360° enregistrée avec succès !');
                            }}
                        />
                    )}
                </div>
            )}

            {/* ── VISITES PHYSIQUES */}
            {activeSection === 'visites' && (
                <Section title="📅 Demandes de visites physiques">
                    {mesVisitesDemandees.length === 0 ? <Empty msg="Aucune demande de visite." /> :
                        mesVisitesDemandees.map(v => {
                            const b = biens.find(b => b.id === v.bienId);
                            return (
                                <div key={v.id} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    {b && <img src={b.imageMain} alt={b.nom} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: 'var(--text-white)', fontWeight: 700 }}>{b?.nom || v.bienId}</p>
                                        <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>Date souhaitée : {v.dateVisite}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Demandé le {v.date}</p>
                                    </div>
                                    {v.statusVisite === 'En attente' ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => validerVisite(v.id, true)}
                                                style={{ background: 'rgba(34,197,94,0.15)', border: 'none', color: '#22c55e', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Check size={14} /> Confirmer
                                            </button>
                                            <button onClick={() => validerVisite(v.id, false)}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <X size={14} /> Refuser
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: v.statusVisite === 'Confirmée' ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '13px' }}>
                                            {v.statusVisite}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                </Section>
            )}

            {/* ── BIENS VENDUS (read-only) */}
            {activeSection === 'vendus' && (
                <Section title=" Biens vendus (non modifiables)">
                    {biensVendus.length === 0 ? <Empty msg="Aucun bien vendu." /> :
                        biensVendus.map(b => (
                            <div key={b.id} className="glass-card" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center', opacity: 0.75 }}>
                                <img src={b.imageMain} alt={b.nom} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'var(--text-white)', fontWeight: 700 }}>{b.nom}</p>
                                    <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{b.localisation} · {formatPrix(b.prix)}</p>
                                </div>
                                <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '4px 12px', borderRadius: 999, fontSize: '12px', fontWeight: 700 }}>
                                    VENDU
                                </span>
                            </div>
                        ))}
                </Section>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard() {
    const { clients, proprietaires, achats, biens, toggleCompteActif, pendingProprietorRequests, approuverProprietaire, rejeterProprietaire } = useApp();
    const [activeSection, setActiveSection] = useState<'clients' | 'props' | 'histo' | 'requests'>('clients');
    const [activeMainTab, setActiveMainTab] = useState<'client' | 'proprietaire' | 'admin'>('admin');

    const navBtn = (key: typeof activeSection, label: string) => (
        <button
            onClick={() => setActiveSection(key)}
            style={{
                padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)',
                background: activeSection === key ? 'var(--accent-orange)' : 'rgba(255,255,255,0.04)',
                color: activeSection === key ? '#fff' : 'var(--text-gray)',
                fontWeight: 600, cursor: 'pointer', fontSize: '14px',
            }}
        >{label}</button>
    );

    const mainTabBtn = (key: typeof activeMainTab, label: string) => (
        <button
            onClick={() => setActiveMainTab(key)}
            style={{
                padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)',
                background: activeMainTab === key ? 'var(--accent-purple)' : 'rgba(255,255,255,0.04)',
                color: activeMainTab === key ? '#fff' : 'var(--text-gray)',
                fontWeight: 700, cursor: 'pointer', fontSize: '14px',
            }}
        >{label}</button>
    );

    const getBien = (id: string) => biens.find(b => b.id === id);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Main Tabs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                {mainTabBtn('client', '👤 Espace Client')}
                {mainTabBtn('proprietaire', ' Espace Propriétaire')}
                {mainTabBtn('admin', ' Administration Platform')}
            </div>

            {/* Main Tab Render */}
            {activeMainTab === 'client' && (
                <ClientDashboardContent showDevenirProp={false} />
            )}

            {activeMainTab === 'proprietaire' && (
                <ProprietaireDashboard />
            )}

            {activeMainTab === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
                        {[
                            { label: 'Clients inscrits', value: clients.length, icon: <User size={20} /> },
                            { label: 'Propriétaires', value: proprietaires.length, icon: <Users size={20} /> },
                            { label: 'Transactions totales', value: achats.length, icon: <Package size={20} /> },
                        ].map(s => (
                            <div key={s.label} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ color: '#ef4444' }}>{s.icon}</div>
                                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-white)' }}>{s.value}</p>
                                <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {navBtn('clients', `👤 Clients (${clients.length})`)}
                        {navBtn('props', ` Propriétaires (${proprietaires.length})`)}
                        {navBtn('requests', ` Demandes (${pendingProprietorRequests.length})`)}
                        {navBtn('histo', ' Historique global')}
                    </div>

                    {/* CLIENTS */}
                    {activeSection === 'clients' && (
                        <Section title="👤 Gestion des clients">
                            {clients.length === 0 ? <Empty msg="Aucun client." /> :
                                clients.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 700 }}>
                                            {c.nom[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: 'var(--text-white)', fontWeight: 600 }}>{c.nom}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(c as any).email || 'Email non renseigné'} · {c.numero}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleCompteActif('client', c.id)}
                                            style={{
                                                padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                                background: c.compteActif ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                                color: c.compteActif ? '#ef4444' : '#22c55e',
                                            }}
                                        >
                                            {c.compteActif ? 'Désactiver' : 'Réactiver'}
                                        </button>
                                    </div>
                                ))}
                        </Section>
                    )}

                    {/* PROPRIÉTAIRES */}
                    {activeSection === 'props' && (
                        <Section title=" Gestion des propriétaires">
                            {proprietaires.length === 0 ? <Empty msg="Aucun propriétaire." /> :
                                proprietaires.map(p => (
                                    <div key={p.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)', fontWeight: 700 }}>
                                            {p.nom[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: 'var(--text-white)', fontWeight: 600 }}>{p.nom}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.email || 'Email non renseigné'} · {p.numero}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {biens.filter(b => b.proprietaireId === p.id).length} bien(s)
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleCompteActif('proprietaire', p.id)}
                                            style={{
                                                padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                                background: p.compteActif ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                                color: p.compteActif ? '#ef4444' : '#22c55e',
                                            }}
                                        >
                                            {p.compteActif ? 'Désactiver' : 'Réactiver'}
                                        </button>
                                    </div>
                                ))}
                        </Section>
                    )}

                    {/* HISTORIQUE GLOBAL */}
                    {activeSection === 'histo' && (
                        <Section title=" Historique global des transactions">
                            {achats.length === 0 ? <Empty msg="Aucune transaction." /> :
                                achats.map(a => {
                                    const b = getBien(a.bienId);
                                    const client = clients.find(c => c.id === a.clientId);
                                    return (
                                        <div key={a.id} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            {b && <img src={b.imageMain} alt={b.nom} style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'var(--text-white)', fontWeight: 600 }}>{b?.nom || a.bienId}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-gray)' }}>
                                                    Client : {client?.nom || a.clientId} · {a.date}
                                                </p>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {a.typeVisite === 'physique' ? `Visite physique (${a.dateVisite})` :
                                                        a.typeVisite === 'virtuelle' ? 'Visite virtuelle' : 'Achat de bien'}
                                                </p>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>
                                                {a.montant === 0 ? 'Gratuit' : formatPrix(a.montant)}
                                            </span>
                                        </div>
                                    );
                                })}
                        </Section>
                    )}

                    {/* DEMANDES PROPRIÉTAIRES */}
                    {activeSection === 'requests' && (
                        <Section title={` Demandes d'accès Propriétaire (${pendingProprietorRequests.length})`}>
                            {pendingProprietorRequests.length === 0 ? <Empty msg="Aucune demande en attente." /> :
                                pendingProprietorRequests.map(reqId => {
                                    const c = clients.find(cl => cl.id === reqId);
                                    if (!c) return null;
                                    return (
                                        <div key={c.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', fontWeight: 700 }}>
                                                {c.nom[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'var(--text-white)', fontWeight: 600 }}>{c.nom}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(c as any).email} · Client depuis peu</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => approuverProprietaire(c.id)}
                                                    style={{
                                                        padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                                        background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                                                    }}
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => rejeterProprietaire(c.id)}
                                                    style={{
                                                        padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                                                        background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                                                    }}
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </Section>
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 style={{ color: 'var(--text-white)', fontWeight: 700, marginBottom: '16px', fontSize: '18px' }}>{title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>
        </div>
    );
}

function Empty({ msg }: { msg: string }) {
    return (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-gray)', fontSize: '14px' }}>
            {msg}
        </div>
    );
}

interface HistoRowProps {
    image: string; title: string; sub: string; right: React.ReactNode;
}
function HistoRow({ image, title, sub, right }: HistoRowProps) {
    return (
        <div className="glass-card" style={{ display: 'flex', gap: '16px', padding: '14px', alignItems: 'center' }}>
            <img src={image} alt={title} style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-white)', fontWeight: 600 }}>{title}</p>
                <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{sub}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '13px' }}>{right}</div>
        </div>
    );
}

interface BienFormProps {
    form: {
        nom: string; categorie: Bien['categorie']; description: string; prix: number;
        localisation: string; superficie: number; chambres: number; sallesDeBain: number;
        imageMain: string; latitude: number; longitude: number; imagesPieces: ImagesPieces[];
    };
    setForm: React.Dispatch<React.SetStateAction<BienFormProps['form']>>;
    onSave: () => void;
    onCancel: () => void;
    isEdit: boolean;
}
function BienForm({ form, setForm, onSave, onCancel, isEdit }: BienFormProps) {
    const inp = (label: string, key: keyof typeof form, type = 'text') => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-gray)' }}>{label}</label>
            <input
                type={type}
                className="form-input"
                value={form[key] as string | number}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-white)' }}
            />
        </div>
    );

    return (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ color: 'var(--text-white)', fontWeight: 700 }}>{isEdit ? '✏️ Modifier le bien' : '➕ Nouveau bien'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {inp('Nom du bien', 'nom')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Catégorie</label>
                    <select
                        className="form-input"
                        value={form.categorie}
                        onChange={e => setForm(f => ({ ...f, categorie: e.target.value as Bien['categorie'] }))}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-white)' }}
                    >
                        <option value="Villa">Villa</option>
                        <option value="Appartement">Appartement</option>
                        <option value="Studio">Studio</option>
                    </select>
                </div>
                {inp('Prix (FCFA)', 'prix', 'number')}
                {inp('Localisation', 'localisation')}
                {inp('Superficie (m²)', 'superficie', 'number')}
                {inp('Chambres', 'chambres', 'number')}
                {inp('Salles de bain', 'sallesDeBain', 'number')}
                {inp('Latitude', 'latitude', 'number')}
                {inp('Longitude', 'longitude', 'number')}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Image principale</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                                // tierId = id du bien (ou un identifiant temporaire)
                                const tierId = `prop-main-${Date.now()}`;
                                const url = await uploadOrBase64(e.target.files[0], tierId);
                                setForm(f => ({ ...f, imageMain: url }));
                            }
                        }}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '7px 14px', color: 'var(--text-white)' }}
                    />
                    {form.imageMain && <img src={form.imageMain} alt="main prev" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ color: 'var(--text-white)' }}>Images des pièces</h5>
                    <button onClick={() => setForm(f => ({ ...f, imagesPieces: [...f.imagesPieces, { label: `Pièce ${f.imagesPieces.length + 1}`, url: '' }] }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-purple)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        <Plus size={14} /> Ajouter image
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {form.imagesPieces.map((ip, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: 8 }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                    type="text" value={ip.label} placeholder="Nom de la pièce"
                                    onChange={(e) => {
                                        const newIP = [...form.imagesPieces];
                                        newIP[idx].label = e.target.value;
                                        setForm(f => ({ ...f, imagesPieces: newIP }));
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: 6, color: 'var(--text-white)', width: '100%', fontSize: '13px' }}
                                />
                                <input
                                    type="file" accept="image/*"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const tierId = `prop-piece-${idx}-${Date.now()}`;
                                            const url = await uploadOrBase64(e.target.files[0], tierId);
                                            const newIP = [...form.imagesPieces];
                                            newIP[idx].url = url;
                                            setForm(f => ({ ...f, imagesPieces: newIP }));
                                        }
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '5px 12px', borderRadius: 6, color: 'var(--text-white)', fontSize: '13px' }}
                                />
                            </div>
                            {ip.url && <img src={ip.url} alt="prev" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />}
                            <button onClick={() => {
                                const newIP = form.imagesPieces.filter((_, i) => i !== idx);
                                setForm(f => ({ ...f, imagesPieces: newIP }));
                            }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: 6, cursor: 'pointer' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Description</label>
                <textarea
                    className="form-input"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-white)', resize: 'vertical' }}
                />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-gray)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                    Annuler
                </button>
                <button onClick={onSave} style={{ background: 'var(--accent-orange)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                    {isEdit ? 'Enregistrer' : 'Ajouter'}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function DashboardPage() {
    const { currentUser } = useApp();

    return (
        <ProtectedRoute>
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        {currentUser?.role === 'admin' && <ShieldAlert size={24} style={{ color: '#ef4444' }} />}
                        {currentUser?.role === 'proprietaire' && <Home size={24} style={{ color: 'var(--accent-orange)' }} />}
                        {currentUser?.role === 'client' && <User size={24} style={{ color: '#818cf8' }} />}
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-white)' }}>
                            {currentUser?.role === 'admin' ? 'Administration' :
                                currentUser?.role === 'proprietaire' ? 'Espace Propriétaire' :
                                    'Mon Espace Client'}
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-gray)' }}>
                        Connecté en tant que <strong style={{ color: 'var(--accent-orange)' }}>{currentUser?.nom}</strong>
                        {' '}· {currentUser?.email}
                    </p>
                </div>

                {/* Role-based content */}
                {currentUser?.role === 'client' && <ClientDashboard />}
                {currentUser?.role === 'proprietaire' && <ProprietaireDashboard />}
                {currentUser?.role === 'admin' && <AdminDashboard />}
            </div>
        </ProtectedRoute>
    );
}