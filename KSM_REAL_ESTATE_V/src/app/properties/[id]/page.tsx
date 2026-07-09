'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { calculerPrixVisiteVirtuelle } from '../../../utils/pricing';
import DateValidator from '../../../components/DateValidator';
import { useState } from 'react';
import {
  MapPin, BedDouble, Bath, Maximize2, Heart, Star,
  ShoppingCart, Eye, Calendar, Send,
} from 'lucide-react';

// Dynamic import to avoid SSR crash of Leaflet (window is not defined)
const PropertyMap = dynamic(() => import('../../../components/PropertyMap'), { ssr: false });

const formatPrix = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    biens, currentUser, achats,
    demanderVisitePhysique, acheterVisiteVirtuelle, acheterBien,
    addCommentaire, toggleLike, clients,
  } = useApp();

  const bien = biens.find(b => b.id === id);
  const [dateVisite, setDateVisite] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [commentTexte, setCommentTexte] = useState('');
  const [commentNote, setCommentNote] = useState(5);
  const [activeImage, setActiveImage] = useState<string | null>(null);

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

  const mainImg = activeImage || bien.imageMain;
  const prixVisiteVirtuelle = calculerPrixVisiteVirtuelle(bien.likes);
  const currentClient = clients.find(c => c.id === currentUser?.id);
  const isLiked = currentClient?.likedBienIds.includes(bien.id) || false;
  const vendu = bien.etat === 'Acheté';

  const requireAuth = (action: () => void) => {
    if (!currentUser) {
      router.push(`/connexion?redirect=/properties/${bien.id}`);
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

  const handleVisiteVirtuelle = () => requireAuth(async () => {
    await acheterVisiteVirtuelle(currentUser!.id, bien.id);
    setMessage({ text: prixVisiteVirtuelle === 0 ? '🎉 Visite virtuelle GRATUITE activée !' : `💰 Visite virtuelle achetée (${formatPrix(prixVisiteVirtuelle)})`, ok: true });
  });

  const handleAchat = () => requireAuth(async () => {
    if (vendu) return;
    const result = await acheterBien(currentUser!.id, bien.id);
    if (result) setMessage({ text: `🏠 Bien acheté avec succès ! (${formatPrix(result.montant)})`, ok: true });
  });

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
          src={mainImg}
          alt={bien.nom}
          style={{ width: '100%', height: '480px', objectFit: 'cover' }}
        />
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

      {/* Thumbnails gallery */}
      {bien.imagesPieces.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <img
            src={bien.imageMain}
            alt="Principal"
            onClick={() => setActiveImage(bien.imageMain)}
            style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImage === bien.imageMain || !activeImage ? '2px solid var(--accent-orange)' : '2px solid transparent' }}
          />
          {bien.imagesPieces.map(img => (
            <div key={img.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              <img
                src={img.url}
                alt={img.label}
                onClick={() => setActiveImage(img.url)}
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImage === img.url ? '2px solid var(--accent-orange)' : '2px solid transparent' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{img.label}</span>
            </div>
          ))}
        </div>
      )}

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
              { icon: <Maximize2 size={18} />, label: `${bien.superficie} m²` },
              { icon: <BedDouble size={18} />, label: `${bien.chambres} chambres` },
              { icon: <Bath size={18} />, label: `${bien.sallesDeBain} sdb` },
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
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      size={22}
                      fill={n <= commentNote ? '#f59e0b' : 'transparent'}
                      color={n <= commentNote ? '#f59e0b' : 'var(--text-gray)'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setCommentNote(n)}
                    />
                  ))}
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
                  <span style={{ cursor: 'pointer', color: 'var(--accent-orange)', fontWeight: 600 }} onClick={() => router.push(`/connexion?redirect=/properties/${bien.id}`)}>
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
                onClick={handleAchat}
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
                {bien.likes} ♥ × 500 = {bien.likes * 500} FCFA de réduction
              </p>
              <button
                onClick={handleVisiteVirtuelle}
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

          {/* Feedback message */}
          {message && (
            <div style={{
              padding: '12px 16px',
              background: message.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${message.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
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
    </div>
  );
}
