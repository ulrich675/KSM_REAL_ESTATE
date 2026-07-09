import { Bien, Proprietaire, Achat, Client } from '../data/properties';

/**
 * Interface representing ports for our Hexagonal Architecture.
 * This can easily be swapped with a dynamic HttpClient implementation querying a Spring Boot REST API.
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
}

// Simulated local storage database adapter
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
        if (index >= 0) {
            list[index] = bien;
        } else {
            list.unshift(bien);
        }
        this.setStorageItem('ksm_biens', list);
        return bien;
    }

    async deleteBien(id: string): Promise<boolean> {
        const list = await this.getBiens();
        const updated = list.filter(b => b.id !== id);
        this.setStorageItem('ksm_biens', updated);
        return true;
    }

    async getProprietaires(): Promise<Proprietaire[]> {
        return this.getStorageItem<Proprietaire[]>('ksm_proprietaires', []);
    }

    async saveProprietaire(prop: Proprietaire): Promise<Proprietaire> {
        const list = await this.getProprietaires();
        const index = list.findIndex(p => p.id === prop.id);
        if (index >= 0) {
            list[index] = prop;
        } else {
            list.push(prop);
        }
        this.setStorageItem('ksm_proprietaires', list);
        return prop;
    }

    async getClients(): Promise<Client[]> {
        return this.getStorageItem<Client[]>('ksm_clients', []);
    }

    async saveClient(c: Client): Promise<Client> {
        const list = await this.getClients();
        const index = list.findIndex(item => item.id === c.id);
        if (index >= 0) {
            list[index] = c;
        } else {
            list.push(c);
        }
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
        if (index >= 0) {
            list[index] = ac;
        }
        this.setStorageItem('ksm_achats', list);
        return ac;
    }
}

export const apiService = new LocalStorageApiAdapter();
