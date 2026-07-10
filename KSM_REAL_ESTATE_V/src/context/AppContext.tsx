'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bien, Proprietaire, Client, Achat, mockBiens, mockProprietaires, mockClients } from '../data/properties';
import { apiService } from '../services/api';
import { loginApi, registerApi } from '../services/httpApi';
import { calculerPrixVisiteVirtuelle } from '../utils/pricing';

export type Role = 'client' | 'proprietaire' | 'admin';
export type Theme = 'dark' | 'light';

export interface UserSession {
    email: string;
    nom: string;
    role: Role;
    id: string;
}

interface AppContextType {
    theme: Theme;
    toggleTheme: () => void;
    role: Role;
    setRole: (role: Role) => void;
    currentUser: UserSession | null;
    login: (email: string, mdp: string) => Promise<{ success: boolean; message?: string }>;
    register: (data: { nom: string; email: string; mdp: string; numero: string; adresse: string }) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    biens: Bien[];
    proprietaires: Proprietaire[];
    clients: Client[];
    achats: Achat[];
    compareIds: string[];
    pendingProprietorRequests: string[];
    toggleCompare: (id: string) => void;
    clearCompare: () => void;
    toggleLike: (bienId: string) => void;
    addCommentaire: (bienId: string, auteur: string, note: number, texte: string) => void;
    acheterBien: (clientId: string, bienId: string) => Promise<Achat | null>;
    acheterVisiteVirtuelle: (clientId: string, bienId: string) => Promise<Achat | null>;
    demanderVisitePhysique: (clientId: string, bienId: string, date: string) => Promise<Achat | null>;
    ajouterBien: (bien: Omit<Bien, 'likes' | 'commentaires' | 'etat'>) => Promise<Bien>;
    modifierBien: (bien: Bien) => Promise<void>;
    supprimerBien: (id: string) => Promise<void>;
    validerVisite: (achatId: string, approuve: boolean) => Promise<void>;
    demanderDevenirProprietaire: (clientId: string) => void;
    approuverProprietaire: (clientId: string) => Promise<void>;
    rejeterProprietaire: (clientId: string) => Promise<void>;
    toggleCompteActif: (type: 'client' | 'proprietaire', id: string) => Promise<void>;
    visitesEnAttenteCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
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
                try {
                    const savedTheme = localStorage.getItem('ksm_theme') as Theme;
                    if (savedTheme) setTheme(savedTheme);

                    if (!localStorage.getItem('ksm_biens')) {
                        localStorage.setItem('ksm_biens', JSON.stringify(mockBiens));
                    }
                    if (!localStorage.getItem('ksm_proprietaires')) {
                        localStorage.setItem('ksm_proprietaires', JSON.stringify(mockProprietaires));
                    }

                    if (!localStorage.getItem('ksm_clients')) {
                        localStorage.setItem('ksm_clients', JSON.stringify(mockClients));
                    } else {
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

                    const requestsStr = localStorage.getItem('ksm_pending_props');
                    if (requestsStr) {
                        setPendingProprietorRequests(JSON.parse(requestsStr));
                    }

                    const sessionStr = localStorage.getItem('ksm_session');
                    if (sessionStr) {
                        const session = JSON.parse(sessionStr) as UserSession;
                        setCurrentUser(session);
                        setRole(session.role);
                    }
                } catch (e) {
                    console.error("Erreur lors du chargement des données locales. Réinitialisation...", e);
                    localStorage.removeItem('ksm_biens');
                    localStorage.removeItem('ksm_proprietaires');
                    localStorage.removeItem('ksm_clients');
                    localStorage.removeItem('ksm_achats');
                    localStorage.removeItem('ksm_pending_props');
                    localStorage.removeItem('ksm_session');

                    localStorage.setItem('ksm_biens', JSON.stringify(mockBiens));
                    localStorage.setItem('ksm_proprietaires', JSON.stringify(mockProprietaires));
                    localStorage.setItem('ksm_clients', JSON.stringify(mockClients));
                    localStorage.setItem('ksm_achats', JSON.stringify([]));
                }
            }

            const bList = await apiService.getBiens();
            const bListWithDetails = await Promise.all(bList.map(async (bien) => {
                try {
                    const comments = await apiService.getCommentsByProperty(bien.id);
                    const likes = await apiService.getTotalLikes(bien.id);
                    return {
                        ...bien,
                        commentaires: comments,
                        likes: likes
                    };
                } catch (err) {
                    console.warn(`[KSM] Failed to load details for property ${bien.id}:`, err);
                    return bien;
                }
            }));
            setBiens(bListWithDetails);

            const pList = await apiService.getProprietaires();
            setProprietaires(pList);

            const cList = await apiService.getClients();
            setClients(cList);

            const aList = await apiService.getAchats();
            setAchats(aList);
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('ksm_theme', newTheme);
    };

    // 2. Auth Actions — LOGIN via backend HTTP avec fallback local (admin)
    const login = async (email: string, mdp: string): Promise<{ success: boolean; message?: string }> => {
        // Admin — auth local only (no kernel-core account)
        if (email === 'admin@ksm.cm' && mdp === 'admin123') {
            const matchedUser: UserSession = { email, nom: 'Admin KSM', role: 'admin', id: 'admin-1' };
            setCurrentUser(matchedUser);
            setRole('admin');
            localStorage.setItem('ksm_session', JSON.stringify(matchedUser));
            return { success: true };
        }

        try {
            const result = await loginApi(email, mdp);

            if (result.nextStep === 'CONFIRM_MFA') {
                // MFA — store mfaToken for next step
                localStorage.setItem('ksm_mfa_token', result.mfaToken ?? '');
                return { success: false, message: 'MFA_REQUIRED' };
            }

            // Store JWT for subsequent API calls
            localStorage.setItem('ksm_token', result.token);

            const backendRole = (result.user?.role ?? 'CLIENT').toUpperCase();
            const role: Role = backendRole === 'ADMIN' ? 'admin'
                : backendRole === 'PROPRIETOR' ? 'proprietaire'
                    : 'client';

            const session: UserSession = {
                email: result.user?.email ?? email,
                nom: `${result.user?.firstName ?? ''} ${result.user?.lastName ?? ''}`.trim() || email,
                role,
                id: String(result.user?.userId ?? Date.now()),
            };

            setCurrentUser(session);
            setRole(role);
            localStorage.setItem('ksm_session', JSON.stringify(session));
            return { success: true };
        } catch (err: unknown) {
            console.warn('[KSM] Backend login failed, trying local mock:', err);

            // Fallback: try local mock data (dev/offline mode)
            const foundProp = proprietaires.find(p => p.email === email && (p as any).mdp === mdp);
            if (foundProp) {
                if (foundProp.compteActif === false)
                    return { success: false, message: "Votre compte a été désactivé par l'administrateur." };
                const session: UserSession = { email, nom: foundProp.nom, role: 'proprietaire', id: foundProp.id };
                setCurrentUser(session); setRole('proprietaire');
                localStorage.setItem('ksm_session', JSON.stringify(session));
                return { success: true };
            }
            const foundClient = clients.find(c => (c as any).email === email && (c as any).mdp === mdp);
            if (foundClient) {
                if (foundClient.compteActif === false)
                    return { success: false, message: "Votre compte a été désactivé par l'administrateur." };
                const session: UserSession = { email, nom: foundClient.nom, role: 'client', id: foundClient.id };
                setCurrentUser(session); setRole('client');
                localStorage.setItem('ksm_session', JSON.stringify(session));
                return { success: true };
            }

            const errMsg = err instanceof Error ? err.message : String(err);
            return { success: false, message: errMsg.includes('401') ? 'Email ou mot de passe incorrect.' : `Erreur réseau : ${errMsg}` };
        }
    };

    // REGISTER — via backend avec fallback local
    const register = async (data: { nom: string; email: string; mdp: string; numero: string; adresse: string }): Promise<{ success: boolean; message?: string }> => {
        try {
            const nameParts = data.nom.trim().split(' ');
            const firstName = nameParts[0] ?? data.nom;
            const lastName = nameParts.slice(1).join(' ') || firstName;

            const result = await registerApi({
                firstName,
                lastName,
                username: data.email.split('@')[0],
                email: data.email,
                phoneNumber: data.numero,
                password: data.mdp,
            });

            localStorage.setItem('ksm_token', result.token);

            const session: UserSession = {
                email: data.email,
                nom: data.nom,
                role: 'client',
                id: String(result.user?.userId ?? Date.now()),
            };
            setCurrentUser(session);
            setRole('client');
            localStorage.setItem('ksm_session', JSON.stringify(session));
            return { success: true };
        } catch (err: unknown) {
            console.warn('[KSM] Backend register failed, using local mock:', err);

            // Fallback local
            const emailExists =
                clients.some(c => (c as any).email === data.email) ||
                proprietaires.some(p => (p as any).email === data.email) ||
                ['admin@ksm.cm', 'ulrich@ksm.cm', 'client@ksm.cm'].includes(data.email);

            if (emailExists) return { success: false, message: 'Cet e-mail est déjà utilisé.' };

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

            const session: UserSession = { email: data.email, nom: data.nom, role: 'client', id: newClient.id };
            setCurrentUser(session);
            setRole('client');
            localStorage.setItem('ksm_session', JSON.stringify(session));
            return { success: true };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setRole('client');
        localStorage.removeItem('ksm_session');
        localStorage.removeItem('ksm_token');
        localStorage.removeItem('ksm_mfa_token');
    };

    // 3. UI Helpers
    const toggleCompare = (id: string) => {
        setCompareIds((prev) => {
            if (prev.includes(id)) return prev.filter((item) => item !== id);
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
        const cl = clients.find(c => c.id === activeClientId);
        const isLiked = cl?.likedBienIds.includes(bienId);

        try {
            await apiService.likeProperty(bienId, activeClientId, !isLiked);

            const updatedClients = clients.map((clItem) => {
                if (clItem.id === activeClientId) {
                    const liked = clItem.likedBienIds.includes(bienId);
                    return {
                        ...clItem,
                        likedBienIds: liked ? clItem.likedBienIds.filter((id) => id !== bienId) : [...clItem.likedBienIds, bienId],
                    };
                }
                return clItem;
            });
            setClients(updatedClients);

            const totalLikes = await apiService.getTotalLikes(bienId);
            const updatedBiens = biens.map((b) => {
                if (b.id === bienId) {
                    return { ...b, likes: totalLikes };
                }
                return b;
            });
            setBiens(updatedBiens);
        } catch (e) {
            console.error('[KSM] toggleLike failed:', e);
            // Fallback purely local
            const updatedClients = clients.map((clItem) => {
                if (clItem.id === activeClientId) {
                    const liked = clItem.likedBienIds.includes(bienId);
                    return {
                        ...clItem,
                        likedBienIds: liked ? clItem.likedBienIds.filter((id) => id !== bienId) : [...clItem.likedBienIds, bienId],
                    };
                }
                return clItem;
            });
            setClients(updatedClients);
            const updatedBiens = biens.map((b) => {
                if (b.id === bienId) {
                    const clItem = updatedClients.find(c => c.id === activeClientId);
                    const liked = clItem?.likedBienIds.includes(bienId);
                    return {
                        ...b,
                        likes: liked ? b.likes + 1 : Math.max(0, b.likes - 1),
                    };
                }
                return b;
            });
            setBiens(updatedBiens);
        }
    };

    const addCommentaire = async (bienId: string, auteur: string, note: number, texte: string) => {
        try {
            const added = await apiService.addComment({
                propertyId: Number(bienId),
                userId: currentUser ? Number(currentUser.id) : 999999, // default fallback
                authorName: auteur || currentUser?.nom || 'Visiteur Anonyme',
                rating: note,
                content: texte,
            });

            const updatedBiens = biens.map((b) => (b.id === bienId ? { ...b, commentaires: [added, ...b.commentaires] } : b));
            setBiens(updatedBiens);
        } catch (e) {
            console.warn('[KSM] addCommentaire failed backend, falling back local:', e);
            const newComment = {
                id: `comment-${Date.now()}`,
                auteur: auteur || currentUser?.nom || 'Visiteur Anonyme',
                note, texte,
                date: new Date().toISOString().split('T')[0],
            };
            const updatedBiens = biens.map((b) => (b.id === bienId ? { ...b, commentaires: [newComment, ...b.commentaires] } : b));
            setBiens(updatedBiens);
        }
    };

    const acheterBien = async (clientId: string, bienId: string) => {
        const bien = biens.find((b) => b.id === bienId);
        if (!bien || bien.etat === 'Acheté') return null;

        try {
            // 1. Process payment via billing-core through backend proxy
            const paymentResult = await apiService.processPayment({
                userId: Number(clientId),
                propertyId: Number(bienId),
                amount: bien.prix,
                currency: 'XAF',
            });
            console.log('[KSM] Purchase payment processed:', paymentResult);

            // 2. Create the Purchase record
            const newAchat: Achat = {
                id: `achat-${Date.now()}`,
                clientId, bienId,
                date: new Date().toISOString().split('T')[0],
                montant: bien.prix,
            };

            const saved = await apiService.saveAchat(newAchat);
            setAchats([saved, ...achats]);

            const updatedBiens = biens.map((b) => (b.id === bienId ? { ...b, etat: 'Acheté' as const } : b));
            const targetBien = updatedBiens.find(b => b.id === bienId);
            if (targetBien) await apiService.saveBien(targetBien);
            setBiens(updatedBiens);

            alert(`Achat réussi ! Un reçu de paiement a été généré via billing-core et enregistré localement.`);

            return saved;
        } catch (e) {
            console.error('[KSM] Achat/Paiement failed:', e);
            alert("L'achat a échoué car le service de facturation kernel-core est indisponible.");
            return null;
        }
    };

    const acheterVisiteVirtuelle = async (clientId: string, bienId: string) => {
        const bien = biens.find((b) => b.id === bienId);
        const likes = bien?.likes || 0;
        const nombreAchats = achats.filter(a => a.clientId === clientId && !a.typeVisite && a.statusVisite !== 'Refusée').length;
        const tourPrice = calculerPrixVisiteVirtuelle(likes, nombreAchats);

        try {
            // Process payment via billing-core through backend proxy
            const paymentResult = await apiService.processPayment({
                userId: Number(clientId),
                propertyId: Number(bienId),
                amount: tourPrice,
                currency: 'XAF',
            });
            console.log('[KSM] Virtual tour payment processed:', paymentResult);

            const newAchat: Achat = {
                id: `achat-virt-${Date.now()}`,
                clientId, bienId,
                date: new Date().toISOString().split('T')[0],
                montant: tourPrice,
                typeVisite: 'virtuelle',
            };

            const saved = await apiService.saveAchat(newAchat);
            setAchats([saved, ...achats]);

            alert(`Paiement de la visite virtuelle effectué via billing-core !`);

            return saved;
        } catch (e) {
            console.error('[KSM] Virtual tour payment failed:', e);
            alert("Erreur lors du paiement de la visite virtuelle via billing-core.");
            return null;
        }
    };

    const demanderVisitePhysique = async (clientId: string, bienId: string, date: string) => {
        const newAchat: Achat = {
            id: `visite-${Date.now()}`,
            clientId, bienId,
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

    const ajouterBien = async (payload: Omit<Bien, 'likes' | 'commentaires' | 'etat'>): Promise<Bien> => {
        const newBien: Bien = { ...payload, etat: 'Disponible', likes: 0, commentaires: [] };
        const saved = await apiService.saveBien(newBien);
        setBiens([saved, ...biens]);
        return saved;
    };

    const modifierBien = async (updatedBien: Bien) => {
        const original = biens.find(b => b.id === updatedBien.id);
        if (!original || original.etat === 'Acheté') return;
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

        const updatedAchat = { ...target, statusVisite: (approuve ? 'Confirmée' : 'Refusée') as any };
        const saved = await apiService.updateAchat(updatedAchat);
        setAchats(achats.map((ac) => (ac.id === achatId ? saved : ac)));
    };

    const demanderDevenirProprietaire = (clientId: string) => {
        setPendingProprietorRequests((prev) => {
            if (prev.includes(clientId)) return prev;
            const up = [...prev, clientId];
            localStorage.setItem('ksm_pending_props', JSON.stringify(up));
            return up;
        });
    };

    const approuverProprietaire = async (clientId: string) => {
        const client = clients.find((c) => c.id === clientId);
        if (!client) return;

        if (proprietaires.some((p) => p.email === (client as any).email)) return;

        const newProp: Proprietaire = {
            id: `prop-${clientId}`,
            nom: client.nom,
            email: (client as any).email,
            mdp: (client as any).mdp,
            numero: client.numero,
            adresse: client.adresse,
            compteActif: true,
        };

        const saved = await apiService.saveProprietaire(newProp);
        setProprietaires([...proprietaires, saved]);

        setPendingProprietorRequests((prev) => {
            const up = prev.filter((id) => id !== clientId);
            localStorage.setItem('ksm_pending_props', JSON.stringify(up));
            return up;
        });
    };

    const rejeterProprietaire = async (clientId: string) => {
        setPendingProprietorRequests((prev) => {
            const up = prev.filter((id) => id !== clientId);
            localStorage.setItem('ksm_pending_props', JSON.stringify(up));
            // Add to refused array to show message
            const ref = JSON.parse(localStorage.getItem('ksm_refused_props') || '[]');
            if (!ref.includes(clientId)) {
                localStorage.setItem('ksm_refused_props', JSON.stringify([...ref, clientId]));
            }
            return up;
        });
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
                theme,
                toggleTheme,
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
                pendingProprietorRequests,
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
                rejeterProprietaire,
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