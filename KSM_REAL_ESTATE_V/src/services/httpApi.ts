/**
 * KSM Real Estate — HTTP API Adapter
 * 
 * Connecte le frontend Next.js (port 3000) au backend Spring Boot (port 8080).
 * Effectue le mapping entre les modèles backend (PropertyResponse, UserResponse…)
 * et les types frontend (Bien, Client, Achat…).
 *
 * Tous les appels passent par le proxy Next.js configuré dans next.config.ts.
 * Le proxy redirige /api/* → http://localhost:8080/api/*
 *
 * @author ulrich675
 * @date 2026-07-10
 */

import { Bien, Proprietaire, Client, Achat, Commentaire } from '../data/properties';
import { KsmApiService } from './api';

const BASE = '/api'; // via proxy Next.js → :8080/api

// ─── helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ksm_token') : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, { ...init, headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} — ${text}`);
    }
    // 204 No Content
    if (res.status === 204) return undefined as T;
    const json = await res.json();
    // Backend enveloppe tout sous { status, data, … }
    return (json.data !== undefined ? json.data : json) as T;
}

// ─── response shapes (subset — backend fields that we actually use) ────────────

interface BackendProperty {
    propertyId: number;
    title: string;
    description: string;
    priceAmount: number;
    streetName: string;
    cityName: string;
    category: string;          // VILLA | APARTMENT | STUDIO
    ownerId: number;
    status?: string;            // AVAILABLE | SOLD
    latitude?: number;
    longitude?: number;
    superficie?: number;
    chambres?: number;
    sallesDeBain?: number;
    imageMain?: string;
    imagesPieces?: Array<{ label: string; url: string }>;
    likes?: number;
    commentaires?: BackendComment[];
}

interface BackendComment {
    commentId?: number;
    id?: string;
    auteur?: string;
    authorName?: string;
    note?: number;
    rating?: number;
    texte?: string;
    content?: string;
    date?: string;
    createdAt?: string;
    userId?: number;
}

interface BackendUser {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    role?: string;   // CLIENT | PROPRIETOR | ADMIN
    active?: boolean;
}

interface BackendVisitRequest {
    requestId: number;
    propertyId: number;
    userId: number;
    requestedAt: string;
    status: string;     // PENDING | CONFIRMED | REJECTED
    visitDate?: string;
    type?: string;      // PHYSICAL | VIRTUAL
    amount?: number;
}

// ─── mappers ──────────────────────────────────────────────────────────────────

function mapCategory(cat: string): 'Villa' | 'Appartement' | 'Studio' {
    const upper = (cat || '').toUpperCase();
    if (upper === 'VILLA') return 'Villa';
    if (upper === 'STUDIO') return 'Studio';
    return 'Appartement';
}

function mapStatus(status: string): 'Disponible' | 'Acheté' {
    return status === 'SOLD' ? 'Acheté' : 'Disponible';
}

function mapComment(c: BackendComment): Commentaire {
    return {
        id: String(c.commentId ?? c.id ?? Date.now()),
        auteur: c.auteur ?? c.authorName ?? 'Anonyme',
        note: c.note ?? c.rating ?? 3,
        texte: c.texte ?? c.content ?? '',
        date: (c.date ?? c.createdAt ?? new Date().toISOString()).split('T')[0],
    };
}

function mapProperty(p: BackendProperty): Bien {
    return {
        id: String(p.propertyId),
        nom: p.title,
        categorie: mapCategory(p.category),
        etat: mapStatus(p.status ?? 'AVAILABLE'),
        description: p.description,
        prix: Number(p.priceAmount),
        localisation: [p.streetName, p.cityName].filter(Boolean).join(', '),
        latitude: p.latitude ?? 4.05,
        longitude: p.longitude ?? 9.77,
        proprietaireId: String(p.ownerId),
        imageMain: p.imageMain ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        imagesPieces: p.imagesPieces ?? [],
        likes: p.likes ?? 0,
        superficie: p.superficie ?? 0,
        chambres: p.chambres ?? 0,
        sallesDeBain: p.sallesDeBain ?? 0,
        commentaires: (p.commentaires ?? []).map(mapComment),
    };
}

function mapUser(u: BackendUser): Client {
    return {
        id: String(u.userId),
        nom: `${u.firstName} ${u.lastName}`.trim(),
        numero: u.phoneNumber ?? '',
        adresse: '',
        likedBienIds: [],
        compteActif: u.active !== false, // default true unless explicitly false
        email: u.email,
    };
}

function mapVisitToAchat(v: BackendVisitRequest): Achat {
    const typeVisite: 'physique' | 'virtuelle' =
        (v.type ?? '').toUpperCase() === 'VIRTUAL' ? 'virtuelle' : 'physique';

    type StatusVisite = 'En attente' | 'Confirmée' | 'Refusée';
    const statusMap: Record<string, StatusVisite> = {
        PENDING: 'En attente',
        CONFIRMED: 'Confirmée',
        REJECTED: 'Refusée',
    };

    return {
        id: String(v.requestId),
        clientId: String(v.userId),
        bienId: String(v.propertyId),
        date: (v.requestedAt ?? new Date().toISOString()).split('T')[0],
        montant: v.amount ?? 0,
        typeVisite,
        dateVisite: v.visitDate,
        statusVisite: statusMap[v.status ?? 'PENDING'] ?? 'En attente',
    };
}

// Helper fallback direct sur LocalStorage pour éviter les dépendances circulaires
function getLocalFallback<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
}

// ─── HTTP Adapter ─────────────────────────────────────────────────────────────

export class HttpApiAdapter implements KsmApiService {
    // ── Properties ──────────────────────────────────────────────────────────────

    async getBiens(): Promise<Bien[]> {
        try {
            const list = await apiFetch<BackendProperty[]>('/properties');
            const mapped = Array.isArray(list) ? list.map(mapProperty) : [];
            if (mapped.length === 0) {
                return getLocalFallback<Bien[]>('ksm_biens', []);
            }
            return mapped;
        } catch (e) {
            console.warn('[KSM] getBiens failed, falling back to local:', e);
            return getLocalFallback<Bien[]>('ksm_biens', []);
        }
    }

    async saveBien(bien: Bien): Promise<Bien> {
        const isNew = !bien.id || bien.id.startsWith('bien-');

        const payload = {
            title: bien.nom,
            description: bien.description,
            priceAmount: bien.prix,
            priceCurrency: 'XAF',
            streetName: bien.localisation.split(',')[0]?.trim() ?? '',
            cityName: bien.localisation.split(',')[1]?.trim() ?? '',
            category: bien.categorie.toUpperCase(),
            latitude: bien.latitude,
            longitude: bien.longitude,
        };

        if (isNew) {
            const saved = await apiFetch<BackendProperty>('/properties', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            return mapProperty(saved);
        } else {
            const saved = await apiFetch<BackendProperty>(`/properties/${bien.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            return mapProperty(saved);
        }
    }

    async deleteBien(id: string): Promise<boolean> {
        await apiFetch<void>(`/properties/${id}`, { method: 'DELETE' });
        return true;
    }

    // ── Proprietaires (mapped from User with role PROPRIETOR) ────────────────────

    async getProprietaires(): Promise<Proprietaire[]> {
        try {
            const list = await apiFetch<BackendUser[]>('/users?role=PROPRIETOR');
            const mapped = Array.isArray(list)
                ? list.map((u) => ({
                    id: String(u.userId),
                    nom: `${u.firstName} ${u.lastName}`.trim(),
                    numero: u.phoneNumber ?? '',
                    adresse: '',
                    compteActif: u.active !== false,
                    email: u.email,
                }))
                : [];
            if (mapped.length === 0) {
                return getLocalFallback<Proprietaire[]>('ksm_proprietaires', []);
            }
            return mapped;
        } catch (e) {
            console.warn('[KSM] getProprietaires failed, falling back to local:', e);
            return getLocalFallback<Proprietaire[]>('ksm_proprietaires', []);
        }
    }

    async saveProprietaire(prop: Proprietaire): Promise<Proprietaire> {
        // Toggle active status if the ID is a real backend ID
        if (prop.id && !prop.id.startsWith('prop-')) {
            try {
                const updated = await apiFetch<BackendUser>(`/users/${prop.id}/toggle-active`, { method: 'PATCH' });
                return { ...prop, compteActif: updated.active !== false };
            } catch (e) {
                console.warn('[KSM] saveProprietaire toggle-active failed:', e);
            }
        }
        return prop;
    }

    // ── Clients (User with role CLIENT) ─────────────────────────────────────────

    async getClients(): Promise<Client[]> {
        try {
            const list = await apiFetch<BackendUser[]>('/users?role=CLIENT');
            const mapped = Array.isArray(list) ? list.map(mapUser) : [];
            if (mapped.length === 0) {
                return getLocalFallback<Client[]>('ksm_clients', []);
            }
            return mapped;
        } catch (e) {
            console.warn('[KSM] getClients failed, falling back to local:', e);
            return getLocalFallback<Client[]>('ksm_clients', []);
        }
    }

    async saveClient(client: Client): Promise<Client> {
        // Toggle active status if the ID is a real backend ID
        if (client.id && !client.id.startsWith('client-')) {
            try {
                const updated = await apiFetch<BackendUser>(`/users/${client.id}/toggle-active`, { method: 'PATCH' });
                return { ...client, compteActif: updated.active !== false };
            } catch (e) {
                console.warn('[KSM] saveClient toggle-active failed:', e);
            }
        }
        return client;
    }

    // ── Achats / Visits ─────────────────────────────────────────────────────────

    async getAchats(): Promise<Achat[]> {
        try {
            const list = await apiFetch<BackendVisitRequest[]>('/visits');
            const mapped = Array.isArray(list) ? list.map(mapVisitToAchat) : [];
            if (mapped.length === 0) {
                return getLocalFallback<Achat[]>('ksm_achats', []);
            }
            return mapped;
        } catch (e) {
            console.warn('[KSM] getAchats failed, falling back to local:', e);
            return getLocalFallback<Achat[]>('ksm_achats', []);
        }
    }

    async saveAchat(achat: Achat): Promise<Achat> {
        const typeMap: Record<string, string> = {
            physique: 'PHYSICAL',
            virtuelle: 'VIRTUAL',
        };

        const payload = {
            propertyId: Number(achat.bienId),
            userId: Number(achat.clientId),
            type: typeMap[achat.typeVisite ?? 'physique'] ?? 'PHYSICAL',
            visitDate: achat.dateVisite ?? null,
        };

        const saved = await apiFetch<BackendVisitRequest>('/visits', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapVisitToAchat(saved);
    }

    async updateAchat(achat: Achat): Promise<Achat> {
        const statusMap: Record<string, string> = {
            'En attente': 'PENDING',
            'Confirmée': 'CONFIRMED',
            'Refusée': 'REJECTED',
        };

        const saved = await apiFetch<BackendVisitRequest>(`/visits/${achat.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: statusMap[achat.statusVisite ?? 'En attente'] }),
        });
        return mapVisitToAchat(saved);
    }

    // --- Services supplémentaires pour kernel-core ---

    async processPayment(paymentReq: { userId: number; propertyId: number; amount: number; currency: string }): Promise<any> {
        return apiFetch<any>('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentReq),
        });
    }

    async getCommentsByProperty(propertyId: string): Promise<Commentaire[]> {
        try {
            const list = await apiFetch<BackendComment[]>(`/comments/property/${propertyId}`);
            return Array.isArray(list) ? list.map(mapComment) : [];
        } catch (e) {
            console.warn(`[KSM] getCommentsByProperty failed for property ${propertyId}:`, e);
            return [];
        }
    }

    async addComment(comment: { propertyId: number; userId: number; authorName: string; rating: number; content: string }): Promise<Commentaire> {
        const payload = {
            propertyId: comment.propertyId,
            userId: comment.userId,
            content: comment.content,
            rating: comment.rating,
        };
        const saved = await apiFetch<BackendComment>('/comments', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return mapComment(saved);
    }

    async likeProperty(propertyId: string, kernelActorId: string, isLike: boolean): Promise<void> {
        await apiFetch<void>(`/comments/property/${propertyId}/like?kernelActorId=${kernelActorId}&isLike=${isLike}`, {
            method: 'POST',
        });
    }

    async getTotalLikes(propertyId: string): Promise<number> {
        try {
            const res = await apiFetch<number>(`/comments/property/${propertyId}/likes/total`);
            return res ?? 0;
        } catch {
            return 0;
        }
    }

    async uploadFile(file: File, tierId: string, documentType: string, label?: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const token = typeof window !== 'undefined' ? localStorage.getItem('ksm_token') : null;
        const headers: Record<string, string> = {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        const queryParams = new URLSearchParams({
            tierId,
            documentType,
            ...(label ? { label } : {}),
        });

        const res = await fetch(`${BASE}/files/upload?${queryParams.toString()}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Upload HTTP ${res.status} — ${text}`);
        }

        const json = await res.json();
        return json.data !== undefined ? json.data : json;
    }

    async getFiles(tierId: string): Promise<any[]> {
        try {
            return await apiFetch<any[]>(`/files/tiers/${tierId}`);
        } catch {
            return [];
        }
    }
}

// ─── Auth helpers (not part of KsmApiService but needed by AppContext) ─────────

export interface LoginResult {
    token: string;
    expiresInSeconds: number;
    user: {
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    nextStep?: string;
    mfaToken?: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResult> {
    return apiFetch<LoginResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function registerApi(data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
}): Promise<LoginResult> {
    return apiFetch<LoginResult>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
