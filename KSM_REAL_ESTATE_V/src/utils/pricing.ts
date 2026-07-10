/**
 * Calcule le prix d'une visite virtuelle selon la formule :
 * prix = max(0, 5000 - nombreAchats * 500)
 * Gratuit si plus de 10 achats.
 * 
 * @param likes - (Déprécié - n'est plus utilisé dans le calcul)
 * @param nombreAchats - Nombre total d'achats du client
 * @returns Prix en FCFA (minimum 0)
 */
export function calculerPrixVisiteVirtuelle(likes: number, nombreAchats: number = 0): number {
  if (nombreAchats >= 10) return 0;
  return Math.max(0, 5000 - (nombreAchats * 500));
}

