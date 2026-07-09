'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bien, Proprietaire, Client, Achat, mockBiens, mockProprietaires, mockClients } from '../data/properties';
import { apiService } from '../services/api';

export type Role = 'client' | 'proprietaire' | 'admin';

export interface UserSession {
    email: string;
    nom: string;
    role: Role;
    id: string;
}

interface AppContextType {
    role: Role;
    setRole: (role: Role) => void;
    currentUser: UserSession | null;
    login: (email: string, mdp: string) => boolean;
    register: (data: { nom: string; email: string; mdp: string; numero: string; adresse: string }) => { success: boolean; message?: string };
    logout: () => void;
    biens: Bien[];
    proprietaires: Proprietaire[];
    clients: Client[];
    achats: Achat[];
    compareIds: string[];
    toggleCompare: (id: string) => void;
    clearCompare: () => void;
    toggleLike: (bienId: string) => void;
    addCommentaire: (bienId: string, auteur: string, note: number, texte: string) => void;
    acheterBien: (clientId: string, bienId: string) => Promise<Achat | null>;
    acheterVisiteVirtuelle: (clientId: string, bienId: string) => Promise<Achat | null>;
    demanderVisitePhysique: (clientId: string, bienId: string, date: string) => Promise<Achat | null>;
    ajouterBien: (bien: Omit<Bien, 'likes' | 'commentaires' | 'etat'>) => Promise<void>;
    modifierBien: (bien: Bien) => Promise<void>;
    supprimerBien: (id: string) => Promise<void>;
    validerVisite: (achatId: string, approuve: boolean) => Promise<void>;
    demanderDevenirProprietaire: (clientId: string) => void;
    approuverProprietaire: (clientId: string) => Promise<void>;
    toggleCompteActif: (type: 'client' | 'proprietaire', id: string) => Promise<void>;
    visitesEnAttenteCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>('client');
    const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
    const [biens, setBiens] = useState<Bien[]>([]);
    const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [achats, setAchats] = useState<Achat[]>([]);
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [pendingProprietorRequests, setPendingProprietorRequests] = useState<string[]>([]);

    // 1. Initial Data Load
    useEffect(() => {
        const loadInitialData = async () => {
            if (typeof window !== 'undefined') {
                // Toujours reseed les données de référence pour garantir la cohérence
                localStorage.setItem('ksm_biens', JSON.stringify(mockBiens));
                localStorage.setItem('ksm_proprietaires', JSON.stringify(mockProprietaires));

                if (!localStorage.getItem('ksm_clients')) {
                    localStorage.setItem('ksm_clients', JSON.stringify(mockClients));
                } else {
                    // Merge: ajouter email/mdp aux clients qui n'en ont pas
                    const existing: Client[] = JSON.parse(localStorage.getItem('ksm_clients')!);
                    const merged = existing.map(ec => {
                        const mock = mockClients.find(mc => mc.id === ec.id);
                        return mock ? { ...ec, email: mock.email, mdp: mock.mdp } : ec;
                    });
                    localStorage.setItem('ksm_clients', JSON.stringify(merged));
                }

                if (!localStorage.getItem('ksm_achats')) {
                    localStorage.setItem('ksm_achats', JSON.stringify([]));
                }

                const sessionStr = localStorage.getItem('ksm_session');
                if (sessionStr) {
                    const session = JSON.parse(sessionStr) as UserSession;
                    setCurrentUser(session);
                    setRole(session.role);
                }
            }

            const bList = await apiService.getBiens();
            setBiens(bList);

            const pList = await apiService.getProprietaires();
            setProprietaires(pList);

            const cList = await apiService.getClients();
            setClients(cList);

            const aList = await apiService.getAchats();
            setAchats(aList);
        };

        loadInitialData();
    }, []);

    // 2. Auth Actions - LOGIN AMÉLIORÉ
    const login = (email: string, mdp: string): boolean => {
        let matchedUser: UserSession | null = null;

        // Admin en dur
        if (email === 'admin@ksm.cm' && mdp === 'admin123') {
            matchedUser = { email, nom: 'Admin KSM', role: 'admin', id: 'admin-1' };
        } else {
            // Chercher parmi les propriétaires (en mémoire)
            const foundProp = proprietaires.find(p => p.email === email && p.mdp === mdp);
            if (foundProp) {
                if (!foundProp.compteActif) return false;
                matchedUser = { email, nom: foundProp.nom, role: 'proprietaire', id: foundProp.id };
            } else {
                // Chercher parmi les clients (en mémoire)
                const foundClient = clients.find(c => (c as any).email === email && (c as any).mdp === mdp);
                if (foundClient) {
                    if (!foundClient.compteActif) return false;
                    matchedUser = { email: (foundClient as any).email, nom: foundClient.nom, role: 'client', id: foundClient.id };
                }
            }
        }

        if (matchedUser) {
            setCurrentUser(matchedUser);
            setRole(matchedUser.role);
            localStorage.setItem('ksm_session', JSON.stringify(matchedUser));
            return true;
        }

        return false;
    };

    // REGISTER - NOUVELLE FONCTION
    const register = (data: { nom: string; email: string; mdp: string; numero: string; adresse: string }): { success: boolean; message?: string } => {
        const emailExists =
            clients.some(c => (c as any).email === data.email) ||
            proprietaires.some(p => (p as any).email === data.email) ||
            data.email === 'admin@ksm.cm' ||
            data.email === 'ulrich@ksm.cm' ||
            data.email === 'client@ksm.cm';

        if (emailExists) {
            return { success: false, message: 'Cet e-mail est déjà utilisé.' };
        }

        const newClient: Client = {
            id: `client-${Date.now()}`,
            nom: data.nom,
            numero: data.numero,
            adresse: data.adresse,
            compteActif: true,
            likedBienIds: [],
            email: data.email,
            mdp: data.mdp,
        } as Client;

        setClients(prev => [...prev, newClient]);
        apiService.saveClient(newClient);

        const session: UserSession = {
            email: data.email,
            nom: data.nom,
            role: 'client',
            id: newClient.id
        };
        setCurrentUser(session);
        setRole('client');
        localStorage.setItem('ksm_session', JSON.stringify(session));

        return { success: true };
    };

    const logout = () => {
        setCurrentUser(null);
        setRole('client');
        localStorage.removeItem('ksm_session');
    };

    // 3. UI Helpers
    const toggleCompare = (id: string) => {
        setCompareIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const clearCompare = () => setCompareIds([]);

    const toggleLike = async (bienId: string) => {
        if (!currentUser) {
            alert('Veuillez vous connecter pour liker un bien');
            return;
        }

        const activeClientId = currentUser.id;

        const updatedClients = clients.map((cl) => {
            if (cl.id === activeClientId) {
                const isLiked = cl.likedBienIds.includes(bienId);
                return {
                    ...cl,
                    likedBienIds: isLiked
                        ? cl.likedBienIds.filter((id) => id !== bienId)
                        : [...cl.likedBienIds, bienId],
                };
            }
            return cl;
        });

        const targetClient = updatedClients.find(c => c.id === activeClientId);
        if (targetClient) {
            await apiService.saveClient(targetClient);
        }
        setClients(updatedClients);

        const updatedBiens = biens.map((b) => {
            if (b.id === bienId) {
                const activeClient = updatedClients.find((c) => c.id === activeClientId);
                const isLiked = activeClient?.likedBienIds.includes(bienId);
                return {
                    ...b,
                    likes: isLiked ? b.likes + 1 : Math.max(0, b.likes - 1),
                };
            }
            return b;
        });

        const targetBien = updatedBiens.find(b => b.id === bienId);
        if (targetBien) {
            await apiService.saveBien(targetBien);
        }
        setBiens(updatedBiens);
    };

    const addCommentaire = async (bienId: string, auteur: string, note: number, texte: string) => {
        const newComment = {
            id: `comment-${Date.now()}`,
            auteur: auteur || currentUser?.nom || 'Visiteur Anonyme',
            note,
            texte,
            date: new Date().toISOString().split('T')[0],
        };

        const updatedBiens = biens.map((b) => {
            if (b.id === bienId) {
                return {
                    ...b,
                    commentaires: [newComment, ...b.commentaires],
                };
            }
            return b;
        });

        const targetBien = updatedBiens.find(b => b.id === bienId);
        if (targetBien) {
            await apiService.saveBien(targetBien);
        }
        setBiens(updatedBiens);
    };

    const acheterBien = async (clientId: string, bienId: string) => {
        const bien = biens.find((b) => b.id === bienId);
        if (!bien || bien.etat === 'Acheté') return null;

        const newAchat: Achat = {
            id: `achat-${Date.now()}`,
            clientId,
            bienId,
            date: new Date().toISOString().split('T')[0],
            montant: bien.prix,
        };

        const saved = await apiService.saveAchat(newAchat);
        setAchats([saved, ...achats]);

        const updatedBiens = biens.map((b) => (b.id === bienId ? { ...b, etat: 'Acheté' as const } : b));
        const targetBien = updatedBiens.find(b => b.id === bienId);
        if (targetBien) {
            await apiService.saveBien(targetBien);
        }
        setBiens(updatedBiens);

        return saved;
    };

    const acheterVisiteVirtuelle = async (clientId: string, bienId: string) => {
        const bien = biens.find((b) => b.id === bienId);
        const likes = bien?.likes || 0;
        const tourPrice = Math.max(0, 5000 - 500 * likes);

        const newAchat: Achat = {
            id: `achat-virt-${Date.now()}`,
            clientId,
            bienId,
            date: new Date().toISOString().split('T')[0],
            montant: tourPrice,
            typeVisite: 'virtuelle',
        };

        const saved = await apiService.saveAchat(newAchat);
        setAchats([saved, ...achats]);
        return saved;
    };

    const demanderVisitePhysique = async (clientId: string, bienId: string, date: string) => {
        const newAchat: Achat = {
            id: `visite-${Date.now()}`,
            clientId,
            bienId,
            date: new Date().toISOString().split('T')[0],
            montant: 0,
            typeVisite: 'physique',
            dateVisite: date,
            statusVisite: 'En attente',
        };

        const saved = await apiService.saveAchat(newAchat);
        setAchats([saved, ...achats]);
        return saved;
    };

    const ajouterBien = async (payload: Omit<Bien, 'likes' | 'commentaires' | 'etat'>) => {
        const newBien: Bien = {
            ...payload,
            etat: 'Disponible',
            likes: 0,
            commentaires: [],
        };
        const saved = await apiService.saveBien(newBien);
        setBiens([saved, ...biens]);
    };

    const modifierBien = async (updatedBien: Bien) => {
        const original = biens.find(b => b.id === updatedBien.id);
        if (!original || original.etat === 'Acheté') return; // bien vendu = non modifiable
        // Forcer la conservation de l'état original (le propriétaire ne peut pas changer l'état)
        const bienToSave = { ...updatedBien, etat: original.etat };
        const saved = await apiService.saveBien(bienToSave);
        setBiens(biens.map((b) => (b.id === saved.id ? saved : b)));
    };

    const supprimerBien = async (id: string) => {
        await apiService.deleteBien(id);
        setBiens(biens.filter((b) => b.id !== id));
    };

    const validerVisite = async (achatId: string, approuve: boolean) => {
        const target = achats.find(ac => ac.id === achatId);
        if (!target) return;

        const updatedAchat = {
            ...target,
            statusVisite: (approuve ? 'Confirmée' : 'Refusée') as any
        };

        const saved = await apiService.updateAchat(updatedAchat);
        setAchats(achats.map((ac) => (ac.id === achatId ? saved : ac)));
    };

    const demanderDevenirProprietaire = (clientId: string) => {
        setPendingProprietorRequests((prev) => {
            if (prev.includes(clientId)) return prev;
            return [...prev, clientId];
        });
    };

    const approuverProprietaire = async (clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        if (!client) return;

        if (proprietaires.some((p) => p.id === `prop-${clientId}`)) return;

        const newProp: Proprietaire = {
            id: `prop-${clientId}`,
            nom: client.nom,
            numero: client.numero,
            adresse: client.adresse,
            compteActif: true,
        };

        const saved = await apiService.saveProprietaire(newProp);
        setProprietaires([...proprietaires, saved]);
        setPendingProprietorRequests((prev) => prev.filter((id) => id !== clientId));
    };

    const toggleCompteActif = async (type: 'client' | 'proprietaire', id: string) => {
        if (type === 'client') {
            const target = clients.find(c => c.id === id);
            if (target) {
                const updated = { ...target, compteActif: !target.compteActif };
                await apiService.saveClient(updated);
                setClients(clients.map(c => c.id === id ? updated : c));
            }
        } else {
            const target = proprietaires.find(p => p.id === id);
            if (target) {
                const updated = { ...target, compteActif: !target.compteActif };
                await apiService.saveProprietaire(updated);
                setProprietaires(proprietaires.map(p => p.id === id ? updated : p));
            }
        }
    };

    const visitesEnAttenteCount = achats.filter(
        (ac) => ac.typeVisite === 'physique' && ac.statusVisite === 'En attente'
    ).length;

    return (
        <AppContext.Provider
            value={{
                role,
                setRole,
                currentUser,
                login,
                register,
                logout,
                biens,
                proprietaires,
                clients,
                achats,
                compareIds,
                toggleCompare,
                clearCompare,
                toggleLike,
                addCommentaire,
                acheterBien,
                acheterVisiteVirtuelle,
                demanderVisitePhysique,
                ajouterBien,
                modifierBien,
                supprimerBien,
                validerVisite,
                demanderDevenirProprietaire,
                approuverProprietaire,
                toggleCompteActif,
                visitesEnAttenteCount,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}