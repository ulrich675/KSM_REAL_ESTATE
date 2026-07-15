'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { calculerPrixVisiteVirtuelle } from '../../../utils/pricing';
import DateValidator from '../../../components/DateValidator';
import {
  MapPin, BedDouble, Bath, Maximize2, Heart, Star,
  ShoppingCart, Eye, Calendar, Send, CreditCard, Banknote, Download, ChevronLeft, ChevronRight, User, Mail, Phone
} from 'lucide-react';
import { printHtmlReceipt } from '../../../utils/fileUtils';

// Dynamic import to avoid SSR crash of Leaflet (window is not defined)
const PropertyMap = dynamic(() => import('../../../components/PropertyMap'), { ssr: false });

const formatPrix = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    biens, currentUser, achats,
    demanderVisitePhysique, acheterVisiteVirtuelle, acheterBien,
    addCommentaire, toggleLike, clients, proprietaires,
  } = useApp();

  const bien = biens.find(b => b.id === id);
  const [dateVisite, setDateVisite] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [commentTexte, setCommentTexte] = useState('');
  const [commentNote, setCommentNote] = useState(5);

  // Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Modal State for Payment
  const [showPaymentModal, setShowPaymentModal] = useState<{ type: 'Achat' | 'VisiteVirtuelle'; prix: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Virement'>('Cash');
  const [receiptGenerated, setReceiptGenerated] = useState<{ html: string } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Combine images array for carousel
  const allImages = React.useMemo(() => {
    if (!bien) return [];
    return [{ label: 'Principal', url: bien.imageMain }, ...bien.imagesPieces];
  }, [bien]);

  if (!bien) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-white)' }}>Bien non trouvé</h2>
        <button onClick={() => router.push('/')} style={{ marginTop: 20, padding: '10px 24px', background: 'var(--accent-orange)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Retour au catalogue
        </button>
      </div>
    );
  }

  const mainImgUrl = allImages[activeImageIndex]?.url || bien.imageMain;
  const mainImgLabel = allImages[activeImageIndex]?.label || 'Image';
  const totalAchatsClient = achats.filter(a => a.clientId === currentUser?.id && !a.typeVisite && a.statusVisite !== 'Refusée').length;
  const prixVisiteVirtuelle = calculerPrixVisiteVirtuelle(bien.likes, totalAchatsClient);
  const currentClient = clients.find(c => c.id === currentUser?.id);
  const isLiked = React.useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'client') {
      const cl = clients.find(c => c.id === currentUser.id);
      return cl?.likedBienIds.includes(bien.id) || false;
    } else if (currentUser.role === 'proprietaire') {
      const prop = proprietaires.find(p => p.id === currentUser.id);
      return (prop as any)?.likedBienIds?.includes(bien.id) || false;
    } else if (currentUser.role === 'admin') {
      return (currentUser as any).likedBienIds?.includes(bien.id) || false;
    }
    return false;
  }, [currentUser, clients, proprietaires, bien.id]);
  const vendu = bien.etat === 'Acheté';

  // Carousel Nav
  const handlePrevImage = () => {
    setActiveImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };
  const handleNextImage = () => {
    setActiveImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };

  const requireAuth = (action: () => void) => {
    if (!currentUser) {
      router.push(`/connexion?redirect=/properties/\${bien.id}`);
      return;
    }
    action();
  };

  const handleDemandeVisite = () => requireAuth(async () => {
    if (!dateVisite) { setMessage({ text: 'Veuillez sélectionner une date', ok: false }); return; }
    if (dateError) { setMessage({ text: 'Date invalide', ok: false }); return; }
    await demanderVisitePhysique(currentUser!.id, bien.id, dateVisite);
    setMessage({ text: '✅ Demande de visite envoyée avec succès !', ok: true });
    setDateVisite('');
  });

  const handleActionClick = (type: 'Achat' | 'VisiteVirtuelle', prix: number) => requireAuth(() => {
    if (vendu && type === 'Achat') return;
    if (prix === 0) {
      if (type === 'VisiteVirtuelle') handleVisiteVirtuelleDirect();
      return;
    }
    setReceiptGenerated(null);
    setShowPaymentModal({ type, prix });
  });

  const generateReceiptHtml = (type: string, prix: number, title: string, method: string) => {
    const prop = proprietaires.find(p => p.id === bien.proprietaireId);
    const client = clients.find(c => c.id === currentUser?.id);
    const refNum = `KSM-${Date.now().toString(36).toUpperCase()}`;
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu KSM Real Estate - ${refNum}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0b0f19; padding: 0; }
    .page { background: #0f1629; max-width: 680px; margin: 0 auto; min-height: 100vh; }
    .top-bar { background: linear-gradient(135deg, #f97316, #7c3aed); height: 6px; }
    .header { padding: 40px 48px 32px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .logo-row { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .logo-circle { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #7c3aed); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 22px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #fff; }
    .logo-text span { color: #f97316; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color: #22c55e; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
    .ref { margin-top: 10px; font-size: 12px; color: #64748b; }
    .body { padding: 32px 48px; }
    .amount-box { background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(124,58,237,0.12)); border: 1px solid rgba(249,115,22,0.3); border-radius: 14px; padding: 28px; text-align: center; margin-bottom: 32px; }
    .amount-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .amount-value { font-size: 38px; font-weight: 800; color: #f97316; line-height: 1; }
    .amount-method { margin-top: 10px; font-size: 13px; color: #94a3b8; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px 20px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 13px; color: #64748b; }
    .row-value { font-size: 13px; color: #e2e8f0; font-weight: 600; text-align: right; max-width: 60%; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
    .footer { padding: 24px 48px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }
    .footer p { font-size: 12px; color: #475569; line-height: 1.8; }
    .footer .hotline { color: #f97316; font-weight: 600; }
    @media print { body { background: white; } .page { background: white; } .card { background: #f8fafc; border-color: #e2e8f0; } .row-value { color: #0f172a; } .row-label { color: #475569; } .amount-value { color: #ea580c; } .logo-text { color: #0f172a; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="top-bar"></div>
    <div class="header">
      <div class="logo-row">
        <div class="logo-circle">K</div>
        <div class="logo-text">KSM <span>REAL ESTATE</span></div>
      </div>
      <div class="badge">✓ Paiement Confirmé</div>
      <p class="ref">Référence : <strong style="color:#94a3b8">${refNum}</strong> &nbsp;|&nbsp; ${new Date().toLocaleString('fr-FR')}</p>
    </div>
    <div class="body">
      <div class="amount-box">
        <div class="amount-label">${type === 'Achat' ? 'Montant de l\'achat' : 'Visite virtuelle'}</div>
        <div class="amount-value">${formatPrix(prix)}</div>
        <div class="amount-method">Réglé par ${method}</div>
      </div>

      <div class="section">
        <div class="section-title">🏠 Bien Immobilier</div>
        <div class="card">
          <div class="row"><span class="row-label">Désignation</span><span class="row-value">${title}</span></div>
          <div class="row"><span class="row-label">Type de transaction</span><span class="row-value">${type === 'Achat' ? 'Achat de propriété' : 'Accès visite virtuelle'}</span></div>
          <div class="row"><span class="row-label">Localisation</span><span class="row-value">${bien.localisation}</span></div>
          <div class="row"><span class="row-label">Superficie</span><span class="row-value">${bien.superficie} m²</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">👤 Acheteur (Client)</div>
        <div class="card">
          <div class="row"><span class="row-label">Nom complet</span><span class="row-value">${client?.nom || currentUser?.nom || '—'}</span></div>
          <div class="row"><span class="row-label">Email</span><span class="row-value">${currentUser?.email || '—'}</span></div>
          <div class="row"><span class="row-label">Téléphone</span><span class="row-value">${(client as any)?.numero || '—'}</span></div>
          <div class="row"><span class="row-label">ID Client</span><span class="row-value">${currentUser?.id || '—'}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🏦 Propriétaire (Vendeur)</div>
        <div class="card">
          <div class="row"><span class="row-label">Nom complet</span><span class="row-value">${prop?.nom || '—'}</span></div>
          <div class="row"><span class="row-label">Téléphone</span><span class="row-value">${prop?.numero || '—'}</span></div>
          <div class="row"><span class="row-label">Email</span><span class="row-value">${prop?.email || '—'}</span></div>
          <div class="row"><span class="row-label">ID Propriétaire</span><span class="row-value">${bien.proprietaireId}</span></div>
        </div>
      </div>

      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-radius:10px;padding:16px 20px">
        <span style="font-size:15px;color:#94a3b8">TOTAL PAYÉ</span>
        <span style="font-size:22px;font-weight:800;color:#f97316">${formatPrix(prix)}</span>
      </div>
    </div>
    <div class="footer">
      <p>Ce document est généré automatiquement et vaut reçu officiel.<br>
      Pour toute réclamation : <span class="hotline">contact@ksm.immo</span><br>
      <span style="color:#334155">KSM Real Estate — Plateforme immobilière de confiance</span></p>
    </div>
  </div>
</body>
</html>`;
  };

  const processPayment = async () => {
    if (!showPaymentModal) return;
    setPaymentLoading(true);
    setPaymentError(null);
    const { type, prix } = showPaymentModal;

    try {
      let result;
      if (type === 'Achat') {
        result = await acheterBien(currentUser!.id, bien.id);
      } else {
        result = await acheterVisiteVirtuelle(currentUser!.id, bien.id);
      }

      if (result) {
        const htmlInfo = generateReceiptHtml(type, prix, bien.nom, paymentMethod);
        setReceiptGenerated({ html: htmlInfo });
        setMessage({ text: `✅ Paiement validé (${paymentMethod}) !`, ok: true });
      } else {
        setPaymentError('Le paiement a échoué. Veuillez réessayer.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('401') || msg.includes('403')) {
        setPaymentError('Session expirée. Veuillez vous reconnecter avant de payer.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setPaymentError('Erreur réseau. Vérifiez votre connexion et réessayez.');
      } else {
        setPaymentError(`Erreur lors du paiement : ${msg}`);
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleVisiteVirtuelleDirect = async () => {
    try {
      const result = await acheterVisiteVirtuelle(currentUser!.id, bien.id);
      if (result) {
        setMessage({ text: '🎉 Visite virtuelle GRATUITE activée !', ok: true });
      } else {
        setMessage({ text: 'La visite virtuelle n\'a pas pu être activée. Réessayez.', ok: false });
      }
    } catch (err: unknown) {
      setMessage({ text: 'Erreur réseau lors de l\'activation de la visite.', ok: false });
    }
  };

  const handleComment = () => requireAuth(async () => {
    if (!commentTexte.trim()) return;
    await addCommentaire(bien.id, currentUser!.nom, commentNote, commentTexte.trim());
    setCommentTexte('');
    setCommentNote(5);
    setMessage({ text: '💬 Commentaire ajouté !', ok: true });
  });

  const handleLike = () => requireAuth(() => toggleLike(bien.id));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      {/* ── HERO IMAGE + GALLERY */}
      <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '32px' }}>
        <img
          src={mainImgUrl}
          alt={bien.nom}
          style={{ width: '100%', height: '480px', objectFit: 'cover' }}
        />

        {/* Carousel controls */}
        {allImages.length > 1 && (
          <>
            <button onClick={handlePrevImage} style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10 }}>
              <ChevronLeft size={24} />
            </button>
            <button onClick={handleNextImage} style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10 }}>
              <ChevronRight size={24} />
            </button>
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
              {activeImageIndex + 1} / {allImages.length} • {mainImgLabel}
            </div>
          </>
        )}

        {/* Overlay badge */}
        <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: '10px' }}>
          <span style={{ background: 'rgba(11,15,25,0.85)', color: 'var(--text-white)', padding: '6px 14px', borderRadius: 999, fontSize: '13px', fontWeight: 700 }}>
            {bien.categorie}
          </span>
          <span style={{
            background: vendu ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)',
            color: '#fff', padding: '6px 14px', borderRadius: 999, fontSize: '13px', fontWeight: 800
          }}>
            {vendu ? '🔴 Vendu' : '✅ Disponible'}
          </span>
        </div>
      </div>

      {/* ── MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
        {/* LEFT: Info */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-white)', lineHeight: 1.2 }}>{bien.nom}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--text-gray)', fontSize: '14px' }}>
                <MapPin size={14} style={{ color: 'var(--accent-orange)' }} />
                <span>{bien.localisation}</span>
              </div>
            </div>
            <button
              onClick={handleLike}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <Heart size={28} fill={isLiked ? 'var(--accent-orange)' : 'transparent'} color={isLiked ? 'var(--accent-orange)' : 'var(--text-gray)'} />
              <span style={{ fontSize: '13px', color: isLiked ? 'var(--accent-orange)' : 'var(--text-gray)', fontWeight: 600 }}>{bien.likes}</span>
            </button>
          </div>

          {/* Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { icon: <Maximize2 size={18} />, label: `\${bien.superficie} m²` },
              { icon: <BedDouble size={18} />, label: `\${bien.chambres} chambres` },
              { icon: <Bath size={18} />, label: `\${bien.sallesDeBain} sdb` },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-orange)' }}>{s.icon}</span>
                <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '12px' }}>Description</h3>
            <p style={{ color: 'var(--text-gray)', lineHeight: '1.75', fontSize: '15px' }}>{bien.description}</p>
          </div>

          {/* Map */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '12px' }}>
              📍 Localisation
            </h3>
            <PropertyMap latitude={bien.latitude} longitude={bien.longitude} nom={bien.nom} adresse={bien.localisation} />
          </div>

          {/* Comments */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '16px' }}>
              💬 Commentaires ({bien.commentaires.length})
            </h3>

            {/* Add Comment Form */}
            {currentUser ? (
              <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>Note :</span>
                  <select
                    value={commentNote}
                    onChange={(e) => setCommentNote(Number(e.target.value))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-white)' }}
                  >
                    <option value={5} style={{ color: '#000' }}>5 Étoiles</option>
                    <option value={4} style={{ color: '#000' }}>4 Étoiles</option>
                    <option value={3} style={{ color: '#000' }}>3 Étoiles</option>
                    <option value={2} style={{ color: '#000' }}>2 Étoiles</option>
                    <option value={1} style={{ color: '#000' }}>1 Étoile</option>
                    <option value={0} style={{ color: '#000' }}>0 Étoile</option>
                  </select>
                </div>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Votre commentaire sur ce bien..."
                  value={commentTexte}
                  onChange={e => setCommentTexte(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-white)', resize: 'vertical' }}
                />
                <button
                  onClick={handleComment}
                  style={{ alignSelf: 'flex-end', background: 'var(--accent-orange)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} /> Publier
                </button>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
                  <span style={{ cursor: 'pointer', color: 'var(--accent-orange)', fontWeight: 600 }} onClick={() => router.push(`/connexion?redirect=/properties/\${bien.id}`)}>
                    Connectez-vous
                  </span>{' '}pour laisser un commentaire.
                </p>
              </div>
            )}

            {/* Comments list */}
            {bien.commentaires.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Soyez le premier à commenter !</p>
            ) : bien.commentaires.map(c => (
              <div key={c.id} className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-white)', fontSize: '14px' }}>{c.auteur}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={14} fill={n <= c.note ? '#f59e0b' : 'transparent'} color={n <= c.note ? '#f59e0b' : 'var(--text-muted)'} />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px', lineHeight: 1.6 }}>{c.texte}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>{c.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Action panel */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Price */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Prix d'achat</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-orange)', margin: '8px 0' }}>{formatPrix(bien.prix)}</p>

            {!vendu ? (
              <button
                onClick={() => handleActionClick('Achat', bien.prix)}
                style={{ width: '100%', padding: '13px', background: 'var(--accent-orange)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShoppingCart size={18} /> Acheter ce bien
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: 10 }}>
                <p style={{ color: '#ef4444', fontWeight: 700 }}>🔴 Ce bien a été vendu</p>
              </div>
            )}
          </div>

          {/* Virtual visit */}
          {!vendu && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Visite virtuelle</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0' }}>
                <p style={{ fontSize: '24px', fontWeight: '800', color: prixVisiteVirtuelle === 0 ? '#22c55e' : 'var(--accent-orange)' }}>
                  {prixVisiteVirtuelle === 0 ? '🎉 GRATUIT' : formatPrix(prixVisiteVirtuelle)}
                </p>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {totalAchatsClient === 0 ? "Visite basée sur le total d'achats" : `\${totalAchatsClient} achat(s) antérieur(s)`}
              </p>
              <button
                onClick={() => handleActionClick('VisiteVirtuelle', prixVisiteVirtuelle)}
                style={{ width: '100%', padding: '11px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Eye size={16} /> Acheter la visite virtuelle
              </button>
            </div>
          )}

          {/* Physical visit */}
          {!vendu && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Visite physique
              </p>
              <label style={{ fontSize: '13px', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Date souhaitée
              </label>
              <DateValidator value={dateVisite} onChange={setDateVisite} onError={setDateError} />
              {dateError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{dateError}</p>}
              <button
                onClick={handleDemandeVisite}
                style={{ width: '100%', padding: '11px', background: 'rgba(249,115,22,0.15)', color: 'var(--accent-orange)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, fontWeight: '700', cursor: 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <MapPin size={16} /> Demander une visite
              </button>
            </div>
          )}

          {/* Contact Propriétaire */}
          {(() => {
            const prop = proprietaires.find(p => p.id === bien.proprietaireId);
            if (!prop) return null;
            return (
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  📞 Contact Propriétaire
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(249,115,22,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(249,115,22,0.2)'
                  }}>
                    <User size={16} style={{ color: 'var(--accent-orange)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-white)' }}>{prop.nom}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {prop.id}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  {prop.email && (
                    <a href={`mailto:${prop.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '13px', textDecoration: 'none' }}>
                      <Mail size={13} style={{ color: 'var(--accent-orange)' }} />
                      <span style={{ fontSize: '13px' }}>{prop.email}</span>
                    </a>
                  )}
                  {prop.numero && (
                    <a href={`tel:${prop.numero}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', fontSize: '13px', textDecoration: 'none' }}>
                      <Phone size={13} style={{ color: 'var(--accent-orange)' }} />
                      <span style={{ fontSize: '13px' }}>{prop.numero}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Feedback message */}
          {message && (
            <div style={{
              padding: '12px 16px',
              background: message.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid \${message.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 10,
              color: message.ok ? '#22c55e' : '#ef4444',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass-card" style={{ width: 400, padding: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ color: 'var(--text-white)', textAlign: 'center', fontSize: 24 }}>Paiement Sécurisé</h3>

            <p style={{ color: 'var(--text-gray)', textAlign: 'center', fontSize: 14 }}>
              Objet : {showPaymentModal.type === 'Achat' ? 'Achat du bien' : 'Visite Virtuelle'}<br />
              Montant : <strong style={{ color: 'var(--accent-orange)' }}>{formatPrix(showPaymentModal.prix)}</strong>
            </p>

            {!receiptGenerated ? (
              <>
                <h4 style={{ color: 'var(--text-white)', fontSize: 16 }}>Mode de paiement</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    style={{ padding: 12, borderRadius: 8, border: paymentMethod === 'Cash' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)', background: paymentMethod === 'Cash' ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.05)', color: paymentMethod === 'Cash' ? 'var(--accent-orange)' : 'var(--text-white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
                  >
                    <Banknote size={18} /> Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Virement')}
                    style={{ padding: 12, borderRadius: 8, border: paymentMethod === 'Virement' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)', background: paymentMethod === 'Virement' ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.05)', color: paymentMethod === 'Virement' ? 'var(--accent-orange)' : 'var(--text-white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
                  >
                    <CreditCard size={18} /> Virement
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  {paymentError && (
                    <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
                      ⚠️ {paymentError}
                    </div>
                  )}
                  <button onClick={() => { setShowPaymentModal(null); setPaymentError(null); }} style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                  <button onClick={processPayment} disabled={paymentLoading} style={{ flex: 1, padding: 12, background: paymentLoading ? '#555' : 'var(--accent-orange)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: paymentLoading ? 'not-allowed' : 'pointer', opacity: paymentLoading ? 0.7 : 1 }}>{paymentLoading ? '⏳ Traitement...' : 'Valider'}</button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={30} />
                </div>
                <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>Paiement réussi !</p>

                <button onClick={() => printHtmlReceipt(receiptGenerated.html)} style={{ width: '100%', padding: '12px', background: 'var(--accent-purple)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Download size={18} /> Imprimer/Enregistrer en PDF
                </button>
                <button onClick={() => { setShowPaymentModal(null); setReceiptGenerated(null); }} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
