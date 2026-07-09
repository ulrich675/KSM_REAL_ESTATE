import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'KSM Real Estate - Plateforme Premium d\'Immobilier',
  description: 'Trouvez, achetez ou planifiez des visites pour les meilleures propriétés à Douala, Yaoundé et partout au Cameroun. Une expérience immobilière haut de gamme.',
  keywords: 'immobilier, KSM, Cameroun, Douala, Yaoundé, villa, appartement, studio, achat, visite',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: '1 0 auto' }}>
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}