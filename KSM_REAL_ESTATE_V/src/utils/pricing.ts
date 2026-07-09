/**
 * Calcule le prix d'une visite virtuelle selon la formule :
 * prix = max(0, 5000 - nombre_de_coeurs * 500)
 * 
 * @param likes - Nombre de coeurs/likes du bien
 * @returns Prix en FCFA (minimum 0)
 */
export function calculerPrixVisiteVirtuelle(likes: number): number {
  return Math.max(0, 5000 - likes * 500);
}
