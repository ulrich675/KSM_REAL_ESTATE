import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(to bottom, #111827, #0b0f19)',
            borderTop: '1px solid var(--border-color)',
            padding: '80px 40px 40px 40px',
            color: 'var(--text-gray)',
            fontSize: '14px',
            marginTop: 'auto',
            flexShrink: 0,
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: '40px',
                marginBottom: '60px',
            }}>
                {/* Brand Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            color: 'var(--text-white)',
                            fontSize: '14px',
                        }}>
                            K
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-title)',
                            fontSize: '20px',
                            fontWeight: '800',
                            color: 'var(--text-white)',
                        }}>
                            KSM REAL ESTATE
                        </span>
                    </div>
                    <p style={{ lineHeight: '1.6', maxWidth: '300px' }}>
                        La plateforme immobilière de référence au Cameroun. Trouvez des propriétés uniques et planifiez vos visites en quelques clics.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={16} className="text-orange" style={{ color: 'var(--accent-orange)' }} />
                            <span>contact@ksm-realestate.cm</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Phone size={16} style={{ color: 'var(--accent-orange)' }} />
                            <span>+237 690 000 000 / +237 670 000 000</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={16} style={{ color: 'var(--accent-orange)' }} />
                            <span>Akwa, Douala - Cameroun 🇨🇲</span>
                        </div>
                    </div>
                </div>

                {/* Links Column 1: Produit */}
                <div>
                    <h4 style={{ color: 'var(--text-white)', marginBottom: '20px', fontSize: '15px' }}>PRODUIT</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><a href="#" style={{ color: 'inherit' }}>Toutes les offres</a></li>
                        <li><a href="#">Villas de Luxe</a></li>
                        <li><a href="#">Appartements Meublés</a></li>
                        <li><a href="#">Studios Étudiants</a></li>
                        <li><a href="#">Financement BICEC</a></li>
                    </ul>
                </div>

                {/* Links Column 2: Solutions */}
                <div>
                    <h4 style={{ color: 'var(--text-white)', marginBottom: '20px', fontSize: '15px' }}>SOLUTIONS</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><a href="#">Pour Acheteurs</a></li>
                        <li><a href="#">Pour Propriétaires</a></li>
                        <li><a href="#">Promoteurs Immobiliers</a></li>
                        <li><a href="#">Investir au Pays</a></li>
                        <li><a href="#">Estimation Gratuite</a></li>
                    </ul>
                </div>

                {/* Links Column 3: Ressources */}
                <div>
                    <h4 style={{ color: 'var(--text-white)', marginBottom: '20px', fontSize: '15px' }}>RESSOURCES</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><a href="#">Guide d\'Achat</a></li>
                        <li><a href="#">Centre d\'aide</a></li>
                        <li><a href="#">FAQ Visites</a></li>
                        <li><a href="#">Calculateur de Crédit</a></li>
                        <li><a href="#">Blog KSM</a></li>
                    </ul>
                </div>

                {/* Links Column 4: Légal */}
                <div>
                    <h4 style={{ color: 'var(--text-white)', marginBottom: '20px', fontSize: '15px' }}>LÉGAL & CONFORMITÉ</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><a href="#">Mentions Légales</a></li>
                        <li><a href="#">Politique de Confidentialité</a></li>
                        <li><a href="#">Conditions de Visite</a></li>
                        <li><a href="#">Garantie de Remboursement</a></li>
                    </ul>
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
            }}>
                <span>© {new Date().getFullYear()} KSM REAL ESTATE. Tous droits réservés. Une plateforme du groupe KSM.</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="#">Conditions Générales</a>
                    <a href="#">Cookies</a>
                    <a href="#">Charte BICEC</a>
                </div>
            </div>
        </footer>
    );
}
