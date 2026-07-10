import { Bien, Proprietaire, Achat, Client, Commentaire } from '../data/properties';
import { HttpApiAdapter } from './httpApi';

/**
 * Interface representing ports for our Hexagonal Architecture.
 */
export interface KsmApiService {
    getBiens(): Promise<Bien[]>;
    saveBien(bien: Bien): Promise<Bien>;
    deleteBien(id: string): Promise<boolean>;

    getProprietaires(): Promise<Proprietaire[]>;
    saveProprietaire(proprietaire: Proprietaire): Promise<Proprietaire>;

    getClients(): Promise<Client[]>;
    saveClient(client: Client): Promise<Client>;

    getAchats(): Promise<Achat[]>;
    saveAchat(achat: Achat): Promise<Achat>;
    updateAchat(achat: Achat): Promise<Achat>;

    // Paiement (billing-core)
    processPayment(paymentReq: { userId: number; propertyId: number; amount: number; currency: string }): Promise<any>;

    // Commentaires (ratings-core)
    getCommentsByProperty(propertyId: string): Promise<Commentaire[]>;
    addComment(comment: { propertyId: number; userId: number; authorName: string; rating: number; content: string }): Promise<Commentaire>;
    likeProperty(propertyId: string, kernelActorId: string, isLike: boolean): Promise<void>;
    getTotalLikes(propertyId: string): Promise<number>;

    // Fichiers/Upload (file-core)
    uploadFile(file: File, tierId: string, documentType: string, label?: string): Promise<any>;
    getFiles(tierId: string): Promise<any[]>;
}

/**
 * LocalStorageApiAdapter — conservé comme fallback hors-ligne.
 */
export class LocalStorageApiAdapter implements KsmApiService {
    private getStorageItem<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue;
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }

    private setStorageItem<T>(key: string, value: T): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

    async getBiens(): Promise<Bien[]> {
        return this.getStorageItem<Bien[]>('ksm_biens', []);
    }

    async saveBien(bien: Bien): Promise<Bien> {
        const list = await this.getBiens();
        const index = list.findIndex(b => b.id === bien.id);
        if (index >= 0) { list[index] = bien; } else { list.unshift(bien); }
        this.setStorageItem('ksm_biens', list);
        return bien;
    }

    async deleteBien(id: string): Promise<boolean> {
        const list = await this.getBiens();
        this.setStorageItem('ksm_biens', list.filter(b => b.id !== id));
        return true;
    }

    async getProprietaires(): Promise<Proprietaire[]> {
        return this.getStorageItem<Proprietaire[]>('ksm_proprietaires', []);
    }

    async saveProprietaire(prop: Proprietaire): Promise<Proprietaire> {
        const list = await this.getProprietaires();
        const index = list.findIndex(p => p.id === prop.id);
        if (index >= 0) { list[index] = prop; } else { list.push(prop); }
        this.setStorageItem('ksm_proprietaires', list);
        return prop;
    }

    async getClients(): Promise<Client[]> {
        return this.getStorageItem<Client[]>('ksm_clients', []);
    }

    async saveClient(c: Client): Promise<Client> {
        const list = await this.getClients();
        const index = list.findIndex(item => item.id === c.id);
        if (index >= 0) { list[index] = c; } else { list.push(c); }
        this.setStorageItem('ksm_clients', list);
        return c;
    }

    async getAchats(): Promise<Achat[]> {
        return this.getStorageItem<Achat[]>('ksm_achats', []);
    }

    async saveAchat(ac: Achat): Promise<Achat> {
        const list = await this.getAchats();
        list.unshift(ac);
        this.setStorageItem('ksm_achats', list);
        return ac;
    }

    async updateAchat(ac: Achat): Promise<Achat> {
        const list = await this.getAchats();
        const index = list.findIndex(item => item.id === ac.id);
        if (index >= 0) { list[index] = ac; }
        this.setStorageItem('ksm_achats', list);
        return ac;
    }

    // --- Mocks pour les nouveaux services ---
    async processPayment(paymentReq: { userId: number; propertyId: number; amount: number; currency: string }): Promise<any> {
        console.log('[KSM Local Mock] processPayment:', paymentReq);
        return { paymentId: `p-${Date.now()}`, status: 'SUCCESS', receiptPdfUrl: '#' };
    }

    async getCommentsByProperty(propertyId: string): Promise<Commentaire[]> {
        console.log('[KSM Local Mock] getCommentsByProperty:', propertyId);
        const biens = await this.getBiens();
        const bien = biens.find(b => b.id === propertyId);
        return bien?.commentaires ?? [];
    }

    async addComment(comment: { propertyId: number; userId: number; authorName: string; rating: number; content: string }): Promise<Commentaire> {
        console.log('[KSM Local Mock] addComment:', comment);
        const newComment: Commentaire = {
            id: `c-${Date.now()}`,
            auteur: comment.authorName,
            note: comment.rating,
            texte: comment.content,
            date: new Date().toISOString().split('T')[0],
        };
        const biens = await this.getBiens();
        const index = biens.findIndex(b => b.id === String(comment.propertyId));
        if (index >= 0) {
            biens[index].commentaires = [newComment, ...(biens[index].commentaires ?? [])];
            this.setStorageItem('ksm_biens', biens);
        }
        return newComment;
    }

    async likeProperty(propertyId: string, kernelActorId: string, isLike: boolean): Promise<void> {
        console.log('[KSM Local Mock] likeProperty:', { propertyId, kernelActorId, isLike });
        const biens = await this.getBiens();
        const index = biens.findIndex(b => b.id === propertyId);
        if (index >= 0) {
            biens[index].likes = (biens[index].likes ?? 0) + (isLike ? 1 : -1);
            this.setStorageItem('ksm_biens', biens);
        }
    }

    async getTotalLikes(propertyId: string): Promise<number> {
        const biens = await this.getBiens();
        const bien = biens.find(b => b.id === propertyId);
        return bien?.likes ?? 0;
    }

    async uploadFile(file: File, tierId: string, documentType: string, label?: string): Promise<any> {
        console.log('[KSM Local Mock] uploadFile:', { file: file.name, tierId, documentType, label });
        return { id: `doc-${Date.now()}`, fileName: file.name, documentType, label };
    }

    async getFiles(tierId: string): Promise<any[]> {
        console.log('[KSM Local Mock] getFiles:', tierId);
        return [];
    }
}

/**
 * Active adapter — appelle le backend Spring Boot via le proxy Next.js.
 * Fallback gracieux sur données mockées locales si le backend est hors ligne.
 */
export const apiService: KsmApiService = new HttpApiAdapter();
