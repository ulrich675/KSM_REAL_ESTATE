export interface VirtualTourImage {
    roomLabel: string;
    imageUrl: string;
    displayOrder: number;
}

/**
 * Service managing Virtual Tours 360.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
export const VirtualTourService = {
    /**
     * Get the virtual tour for a property.
     * Accessible by the owner or a user who purchased the virtual tour.
     */
    getVirtualTour: async (propertyId: number): Promise<VirtualTourImage[]> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ksm_token') : null;
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

        const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/virtual-tour`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
            throw new Error('Impossible de charger la visite virtuelle');
        }

        const data = await response.json();
        return data.data;
    },

    /**
     * Upload virtual tour images for a property.
     * Restricted to the property owner.
     */
    uploadVirtualTourImages: async (
        propertyId: number,
        files: File[],
        roomLabels: string[]
    ): Promise<VirtualTourImage[]> => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        roomLabels.forEach(label => {
            formData.append('roomLabels', label);
        });

        // Use custom apiCall to handle multipart form data
        const token = typeof window !== 'undefined' ? localStorage.getItem('ksm_token') : null;
        if (!token) throw new Error('Utilisateur non authentifié');

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

        const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/virtual-tour`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de l\'upload');
        }

        const data = await response.json();
        return data.data;
    }
};
