export type Categorie = 'Villa' | 'Appartement' | 'Studio';
export type Etat = 'Disponible' | 'Acheté';

export interface Commentaire {
  id: string;
  auteur: string;
  note: number;
  texte: string;
  date: string;
}

export interface ImagesPieces {
  label: string;
  url: string;
}

export interface Bien {
  id: string;
  nom: string;
  categorie: Categorie;
  etat: Etat;
  description: string;
  prix: number;
  localisation: string;
  latitude: number;
  longitude: number;
  proprietaireId: string;
  imageMain: string;
  imagesPieces: ImagesPieces[];
  likes: number;
  commentaires: Commentaire[];
  superficie: number;
  chambres: number;
  sallesDeBain: number;
}

export interface Proprietaire {
  id: string;
  nom: string;
  numero: string;
  adresse: string;
  compteActif: boolean;
  email?: string;
  mdp?: string;
}

export interface Client {
  id: string;
  nom: string;
  numero: string;
  adresse: string;
  likedBienIds: string[];
  compteActif: boolean;
  email?: string;
  mdp?: string;
}

export interface Achat {
  id: string;
  clientId: string;
  bienId: string;
  date: string;
  montant: number;
  typeVisite?: 'virtuelle' | 'physique';
  dateVisite?: string;
  statusVisite?: 'En attente' | 'Confirmée' | 'Refusée';
}

export const mockProprietaires: Proprietaire[] = [
  { id: 'prop-1', nom: 'Ulrich Kuate', numero: '+237 690 123 456', adresse: 'Akwa, Douala', compteActif: true, email: 'ulrich@ksm.cm', mdp: 'ulrich123' },
  { id: 'prop-2', nom: 'Marcelle Ngo', numero: '+237 677 987 654', adresse: 'Bastos, Yaoundé', compteActif: true, email: 'marcelle@ksm.cm', mdp: 'marcelle123' },
  { id: 'prop-3', nom: 'Donald Tchameni', numero: '+237 695 555 444', adresse: 'Bonapriso, Douala', compteActif: true, email: 'donald@ksm.cm', mdp: 'donald123' },
  { id: 'prop-4', nom: 'Sarah Bell', numero: '+237 670 111 222', adresse: 'Golf, Yaoundé', compteActif: false, email: 'sarah@ksm.cm', mdp: 'sarah123' },
];

export const mockClients: Client[] = [
  { id: 'client-1', nom: 'Christian Bella', numero: '+237 690 001 002', adresse: 'Denver, Douala', likedBienIds: [], compteActif: true, email: 'client@ksm.cm', mdp: 'client123' },
  { id: 'client-2', nom: 'Fiona Minka', numero: '+237 671 222 333', adresse: 'Odza, Yaoundé', likedBienIds: [], compteActif: true, email: 'fiona@ksm.cm', mdp: 'fiona123' },
];

export const mockBiens: Bien[] = [
  {
    id: 'bien-1',
    nom: 'Villa Akwa Prestige',
    categorie: 'Villa',
    etat: 'Disponible',
    description: 'Somptueuse villa de maître située au coeur d\'Akwa. Dotée de finitions haut de gamme, d\'un grand jardin arboré et d\'espaces de réception généreux.',
    prix: 450000000,
    localisation: 'Akwa, Douala',
    latitude: 4.0511,
    longitude: 9.7679,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 450,
    chambres: 5,
    sallesDeBain: 6,
    commentaires: [
      { id: 'c-1', auteur: 'Christian Bella', note: 5, texte: 'Magnifique propriété, très bien située !', date: '2026-06-15' }
    ]
  },
  {
    id: 'bien-2',
    nom: 'Villa de la Vallée Yaoundé',
    categorie: 'Villa',
    etat: 'Disponible',
    description: 'Au calme, dans un quartier résidentiel de la vallée. Vue panoramique sur les collines, piscine et dépendances.',
    prix: 380000000,
    localisation: 'Mvog-Mbi, Yaoundé',
    latitude: 3.8667,
    longitude: 11.5167,
    proprietaireId: 'prop-2',
    imageMain: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 380,
    chambres: 4,
    sallesDeBain: 4,
    commentaires: []
  },
  {
    id: 'bien-3',
    nom: 'Villa Bonamoussadi Moderne',
    categorie: 'Villa',
    etat: 'Disponible',
    description: 'Architecture contemporaine dans un quartier calme. Grand salon, cuisine ouverte et espace extérieur aménagé.',
    prix: 290000000,
    localisation: 'Bonamoussadi, Douala',
    latitude: 4.0833,
    longitude: 9.6833,
    proprietaireId: 'prop-3',
    imageMain: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 320,
    chambres: 4,
    sallesDeBain: 3,
    commentaires: []
  },
  {
    id: 'bien-4',
    nom: 'Villa des Cocotiers Kribi',
    categorie: 'Villa',
    etat: 'Acheté',
    description: 'Exceptionnelle villa avec accès privé à la plage, grande piscine et une vue magnifique sur l\'océan.',
    prix: 380000000,
    localisation: 'Kribi',
    latitude: 2.9333,
    longitude: 9.9167,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 500,
    chambres: 5,
    sallesDeBain: 5,
    commentaires: [
      { id: 'c-2', auteur: 'Fiona Minka', note: 4, texte: 'Le coucher de soleil y est magique ! acheté par mon oncle.', date: '2026-05-19' }
    ]
  },
  {
    id: 'bien-5',
    nom: 'Appartement Kribi Lounge',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Appartement de standing entièrement meublé, offrant un accès direct à la plage et une magnifique terrasse panoramique.',
    prix: 120000000,
    localisation: 'Kribi',
    latitude: 2.9333,
    longitude: 9.9167,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 160,
    chambres: 3,
    sallesDeBain: 2,
    commentaires: []
  },
  {
    id: 'bien-6',
    nom: 'Appartement Bastos Skyline',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Au 6ème étage d\'une résidence neuve sécurisée, cet appartement offre une vue imprenable à 360° sur Yaoundé Bastos.',
    prix: 210000000,
    localisation: 'Bastos, Yaoundé',
    latitude: 3.8833,
    longitude: 11.5167,
    proprietaireId: 'prop-2',
    imageMain: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1600566752229-275ae3068e64?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 220,
    chambres: 4,
    sallesDeBain: 3,
    commentaires: []
  },
  {
    id: 'bien-7',
    nom: 'Appartement Bonapriso Chic',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Bel appartement spacieux dans une rue calme de Bonapriso. Spacieux, lumineux et doté d\'une cuisine américaine équipée.',
    prix: 180000000,
    localisation: 'Bonapriso, Douala',
    latitude: 4.0667,
    longitude: 9.7667,
    proprietaireId: 'prop-3',
    imageMain: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1540518596637-2ee3c9f173e5?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 190,
    chambres: 3,
    sallesDeBain: 3.5,
    commentaires: []
  },
  {
    id: 'bien-8',
    nom: 'Appartement Denver Résidence',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Architecture moderne dans le quartier résidentiel de Denver à Douala. Double vitrage, climatisation centrale et parking sous-terrain.',
    prix: 145000000,
    localisation: 'Denver, Douala',
    latitude: 4.0833,
    longitude: 9.7667,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 175,
    chambres: 3,
    sallesDeBain: 2,
    commentaires: []
  },
  {
    id: 'bien-9',
    nom: 'Appartement Odza Soleil',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Bel appartement familial situé à Odza. Proche des écoles internationales et des commodités. Très calme.',
    prix: 110000000,
    localisation: 'Odza, Yaoundé',
    latitude: 3.8667,
    longitude: 11.5500,
    proprietaireId: 'prop-2',
    imageMain: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 150,
    chambres: 3,
    sallesDeBain: 2.5,
    commentaires: []
  },
  {
    id: 'bien-10',
    nom: 'Appartement Bonamoussadi Familial',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Idéal pour une famille, dans les zones paisibles de Bonamoussadi. Sécurité garantie 24h/24, balcon et parking.',
    prix: 95000000,
    localisation: 'Bonamoussadi, Douala',
    latitude: 4.0833,
    longitude: 9.6833,
    proprietaireId: 'prop-3',
    imageMain: 'https://images.unsplash.com/photo-1600607686527-9fb2c0903ede?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1560185008-b03126090c10?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 140,
    chambres: 3,
    sallesDeBain: 2,
    commentaires: []
  },
  {
    id: 'bien-11',
    nom: 'Appartement Ngoa Penthouse',
    categorie: 'Appartement',
    etat: 'Disponible',
    description: 'Somptueux penthouse dominant le quartier universitaire et administratif. Prestations haut de gamme exclusives.',
    prix: 280000000,
    localisation: 'Ngoa-Ekelle, Yaoundé',
    latitude: 3.8833,
    longitude: 11.5333,
    proprietaireId: 'prop-2',
    imageMain: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 310,
    chambres: 4,
    sallesDeBain: 4,
    commentaires: []
  },
  {
    id: 'bien-12',
    nom: 'Studio VIP Bonapriso',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Studio haut de gamme avec cuisine américaine ouverte, meublé à Bonapriso. Climatisation, piscine de résidence.',
    prix: 65000000,
    localisation: 'Bonapriso, Douala',
    latitude: 4.0667,
    longitude: 9.7667,
    proprietaireId: 'prop-3',
    imageMain: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1565538810844-1e119fa11126?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1620626011161-997c51447094?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 60,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-13',
    nom: 'Studio Bastos Executive',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Idéal pour cadres ou expatriés de passage à Yaoundé. Parfaitement équipé, sécurisé et connecté.',
    prix: 85000000,
    localisation: 'Bastos, Yaoundé',
    latitude: 3.8833,
    longitude: 11.5167,
    proprietaireId: 'prop-2',
    imageMain: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 75,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-14',
    nom: 'Studio Akwa Cozy',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Petit cocon douillet et moderne en plein coeur d\'Akwa. Parfait pour un étudiant ou jeune professionnel.',
    prix: 45000000,
    localisation: 'Akwa, Douala',
    latitude: 4.0500,
    longitude: 9.7667,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1565538810844-1e119fa11126?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1620626011161-997c51447094?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 45,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-15',
    nom: 'Studio Kribi Wave',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Profitez de la plage à petit prix. Un studio entièrement aménagé et optimisé avec balcon face mer.',
    prix: 55000000,
    localisation: 'Kribi',
    latitude: 2.9333,
    longitude: 9.9167,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 50,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-16',
    nom: 'Studio Denver Loft',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Style industriel haut standing à Denver. Belle hauteur sous plafond, mezzanine et mobilier design compris.',
    prix: 72000000,
    localisation: 'Denver, Douala',
    latitude: 4.0833,
    longitude: 9.7667,
    proprietaireId: 'prop-3',
    imageMain: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 80,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-17',
    nom: 'Studio Bastos Student',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Pour étudiant ou jeuneactif cherchant le calme et la sécurité à Bastos. Accès facile aux transports et commerces.',
    prix: 40000000,
    localisation: 'Bastos, Yaoundé',
    latitude: 3.8833,
    longitude: 11.5167,
    proprietaireId: 'prop-2',
    imageMain: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 40,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-18',
    nom: 'Studio Odza Budget',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Studio propre, meublé avec soin et accessible à Odza. Eau de forage, groupe électrogène disponible.',
    prix: 35000000,
    localisation: 'Odza, Yaoundé',
    latitude: 3.8667,
    longitude: 11.5500,
    proprietaireId: 'prop-4',
    imageMain: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 48,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  },
  {
    id: 'bien-19',
    nom: 'Studio Kribi Plage Simple',
    categorie: 'Studio',
    etat: 'Disponible',
    description: 'Joli studio rustique tout proche des vagues à Kribi. Une affaire excellente pour un investissement locatif court terme.',
    prix: 30000000,
    localisation: 'Kribi',
    latitude: 2.9333,
    longitude: 9.9167,
    proprietaireId: 'prop-1',
    imageMain: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
    imagesPieces: [
      { label: 'Salon', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' },
      { label: 'Cuisine', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80' },
      { label: 'Chambre', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80' },
      { label: 'Salle de bain', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' }
    ],
    likes: 0,
    superficie: 42,
    chambres: 1,
    sallesDeBain: 1,
    commentaires: []
  }
];
