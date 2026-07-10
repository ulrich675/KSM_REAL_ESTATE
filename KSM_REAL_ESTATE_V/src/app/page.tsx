'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Home, DollarSign, Heart, Check, ArrowRight, RefreshCw, X } from 'lucide-react';

export default function HomePage() {
  const { biens, toggleLike, toggleCompare, compareIds, clearCompare, clients, currentUser } = useApp();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('All');
  const [selectedLocalisation, setSelectedLocalisation] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000000000); // 1 Billion FCFA max default
  const [activeTab, setActiveTab] = useState<'All' | 'Popular'>('All');

  // Filtrer les biens disponibles (Point 6)
  const biensDisponibles = biens.filter(b => b.etat === 'Disponible');

  // Extracts distinct locations for filter dropdown
  const localisations = Array.from(new Set(biensDisponibles.map((b) => b.localisation.split(',')[0].trim())));

  // Check if liked by current user
  const isLiked = (bienId: string) => {
    if (!currentUser) return false;
    const activeClient = clients.find((c) => c.id === currentUser.id);
    return activeClient?.likedBienIds.includes(bienId) || false;
  };

  // Filter Logic - Utilise biensDisponibles au lieu de biens
  const filteredBiens = biensDisponibles
    .filter((b) => {
      const matchesSearch = b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategorie = selectedCategorie === 'All' || b.categorie === selectedCategorie;
      const matchesLocalisation = selectedLocalisation === 'All' || b.localisation.includes(selectedLocalisation);
      const matchesPrice = b.prix <= maxPrice;
      const matchesTab = activeTab === 'All' || b.likes > 0; // Populaires = au moins 1 like

      return matchesSearch && matchesCategorie && matchesLocalisation && matchesPrice && matchesTab;
    });

  // Calculate currency format
  const formatPrix = (p: number) => {
    return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA';
  };

  // Get selected properties to compare
  const itemsToCompare = biens.filter((b) => compareIds.includes(b.id));

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. HERO SECTION WITH GENERATED APARTMENT BACKGROUND */}
      <section
        id="hero-sec"
        style={{
          position: 'relative',
          height: '80vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(rgba(11, 15, 25, 0.7), rgba(11, 15, 25, 0.85)), url("/apartment_hero_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '20px',
        }}
      >
        <div style={{
          maxWidth: '1000px',
          textAlign: 'center',
          zIndex: 2,
          animation: 'fadeIn 0.6s ease forwards'
        }}>
          <span style={{
            color: 'var(--accent-orange)',
            textTransform: 'uppercase',
            fontWeight: '800',
            letterSpacing: '3px',
            fontSize: '14px',
            background: 'rgba(249, 115, 22, 0.1)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
          }}>
            Luxe & Minimalisme
          </span>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '56px',
            fontWeight: '800',
            lineHeight: '1.1',
            margin: '20px 0',
            color: 'var(--text-white)',
          }}>
            Votre entreprise mérite un seul système,<br />
            <span style={{
              background: 'linear-gradient(to right, var(--accent-orange), #fcd34d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Vos biens immobiliers aussi.</span>
          </h1>
          <p style={{
            color: 'var(--text-gray)',
            fontSize: '18px',
            maxWidth: '700px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6',
          }}>
            Découvrez notre catalogue exclusif de villas, appartements et studios de standing au Cameroun (Douala, Yaoundé, Kribi).
          </p>
        </div>

        {/* Dynamic Search Bar Component */}
        <div
          className="glass animate-fade-in"
          style={{
            maxWidth: '1100px',
            width: '100%',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '16px',
            zIndex: 5,
            boxShadow: 'var(--shadow-premium)',
          }}
        >
          {/* Key text input */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" htmlFor="search-input">Rechercher</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                id="search-input"
                type="text"
                className="form-input"
                placeholder="Ex: Villa Bastos..."
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categorie selector */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" htmlFor="cat-select">Catégorie</label>
            <select
              id="cat-select"
              className="form-input"
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="All">Toutes catégories</option>
              <option value="Villa">Villas</option>
              <option value="Appartement">Appartements</option>
              <option value="Studio">Studios</option>
            </select>
          </div>

          {/* Localisation selector */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" htmlFor="loc-select">Ville / Lieu</label>
            <select
              id="loc-select"
              className="form-input"
              value={selectedLocalisation}
              onChange={(e) => setSelectedLocalisation(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="All">Tout le Cameroun</option>
              {localisations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Max price filter slider */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" htmlFor="price-range">
              Budget Max: <span style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>{maxPrice / 1000000}M FCFA</span>
            </label>
            <input
              id="price-range"
              type="range"
              min={30000000}
              max={1000000000}
              step={10000000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-orange)',
                height: '40px',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. CATALOG SECTION */}
      <section id="catalogue-sec" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '40px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '20px',
        }}>
          <div>
            <h2 style={{ fontSize: '32px', color: 'var(--text-white)' }}>Nos Propriétés d'Exception</h2>
            <p style={{ color: 'var(--text-gray)', marginTop: '8px' }}>
              Affichage de {filteredBiens.length} résultats sur {biensDisponibles.length} biens disponibles.
            </p>
          </div>

          {/* Tab switches for Popular vs All */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <button
              id="tab-all"
              onClick={() => setActiveTab('All')}
              style={{
                background: activeTab === 'All' ? 'var(--accent-orange)' : 'transparent',
                color: 'var(--text-white)',
                padding: '8px 16px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Tous les biens
            </button>
            <button
              id="tab-popular"
              onClick={() => setActiveTab('Popular')}
              style={{
                background: activeTab === 'Popular' ? 'var(--accent-orange)' : 'transparent',
                color: 'var(--text-white)',
                padding: '8px 16px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Populaires 🔥
            </button>
          </div>
        </div>

        {/* Property Grid */}
        {filteredBiens.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <p style={{ color: 'var(--text-gray)', fontSize: '18px' }}>Aucun bien ne correspond à vos critères de recherche.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('All');
                setSelectedLocalisation('All');
                setMaxPrice(1000000000);
                setActiveTab('All');
              }}
              style={{
                marginTop: '20px',
                background: 'transparent',
                border: '1px solid var(--accent-orange)',
                color: 'var(--accent-orange)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px',
          }}>
            {filteredBiens.map((bien) => (
              <article key={bien.id} className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Property Image Cover */}
                <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
                  <img
                    src={bien.imageMain}
                    alt={bien.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />

                  {/* Category Tag */}
                  <span style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: 'rgba(11, 15, 25, 0.8)',
                    color: 'var(--text-white)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid var(--border-color)',
                  }}>
                    {bien.categorie}
                  </span>

                  {/* Buy/Booked status indicator */}
                  <span style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: bien.etat === 'Disponible' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: '800',
                  }}>
                    {bien.etat}
                  </span>
                </div>

                {/* Card Info */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-white)' }}>{bien.nom}</h3>

                    {/* Like Action */}
                    <button
                      id={`like-btn-${bien.id}`}
                      onClick={() => toggleLike(bien.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isLiked(bien.id) ? 'var(--accent-orange)' : 'var(--text-gray)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      <Heart size={18} fill={isLiked(bien.id) ? 'var(--accent-orange)' : 'transparent'} />
                      <span>{bien.likes}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)', fontSize: '13px', marginBottom: '16px' }}>
                    <MapPin size={14} style={{ color: 'var(--accent-orange)' }} />
                    <span>{bien.localisation}</span>
                  </div>

                  <p style={{ color: 'var(--text-gray)', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flexGrow: 1 }}>
                    {bien.description.substring(0, 110)}...
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '16px',
                    marginBottom: '20px'
                  }}>
                    <span>{bien.superficie} m²</span>
                    <span>•</span>
                    <span>{bien.chambres} Ch</span>
                    <span>•</span>
                    <span>{bien.sallesDeBain} Sdb</span>
                  </div>

                  {/* Price & Primary Link */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acheter</span>
                      <strong style={{ fontSize: '18px', color: 'var(--accent-orange)', fontWeight: '800' }}>
                        {formatPrix(bien.prix)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Compare Checkbox */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'var(--text-gray)',
                        userSelect: 'none'
                      }}>
                        <input
                          id={`compare-check-${bien.id}`}
                          type="checkbox"
                          checked={compareIds.includes(bien.id)}
                          onChange={() => toggleCompare(bien.id)}
                          style={{ accentColor: 'var(--accent-orange)' }}
                        />
                        <span>Comparer</span>
                      </label>

                      <Link
                        href={`/properties/${bien.id}`}
                        id={`details-btn-${bien.id}`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-white)',
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                      >
                        <span>Détails</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 3. COMPARISON SECTION / DRAWER */}
      {compareIds.length > 0 && (
        <section
          id="comparateur-sec"
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderTop: '2px solid var(--accent-orange)',
            padding: '30px 40px',
            zIndex: 900,
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <RefreshCw size={22} className="animate-spin" style={{ color: 'var(--accent-orange)' }} />
                <h3 style={{ fontSize: '20px', color: 'var(--text-white)' }}>Comparateur de Biens ({compareIds.length}/3)</h3>
              </div>
              <button
                id="clear-compare-btn"
                onClick={clearCompare}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-gray)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                }}
              >
                <X size={16} />
                Vider le comparateur
              </button>
            </div>

            {/* Comparison Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${itemsToCompare.length}, 1fr)`,
              gap: '20px',
            }}>
              {itemsToCompare.map((item) => (
                <div key={item.id} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: '12px',
                  position: 'relative',
                }}>
                  {/* Small avatar image */}
                  <img
                    src={item.imageMain}
                    alt={item.nom}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '4px' }}>
                      {item.nom}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      {formatPrix(item.prix)}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-gray)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      <span>Type: {item.categorie}</span>
                      <span>Lieu: {item.localisation.split(',')[0]}</span>
                      <span>Taille: {item.superficie} m²</span>
                      <span>Chambres: {item.chambres}</span>
                    </div>
                  </div>

                  {/* Remove specific item from compare list */}
                  <button
                    id={`remove-compare-${item.id}`}
                    onClick={() => toggleCompare(item.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {compareIds.length >= 2 && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link
                  href="/compare"
                  style={{
                    background: 'var(--accent-purple)',
                    color: 'var(--text-white)',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>Consulter le résumé comparatif complet</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}