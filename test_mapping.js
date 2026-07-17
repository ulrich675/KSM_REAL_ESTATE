// test_mapping.js
const http = require('http');

function mapCategory(cat) {
    const upper = (cat || '').toUpperCase();
    if (upper === 'VILLA') return 'Villa';
    if (upper === 'STUDIO') return 'Studio';
    return 'Appartement';
}

function mapStatus(status) {
    return status === 'SOLD' ? 'Acheté' : 'Disponible';
}

function mapProperty(p) {
    let imagesPieces = p.imagesPieces || [];
    if (p.images_pieces_json) {
        try {
            imagesPieces = JSON.parse(p.images_pieces_json);
        } catch (_) { }
    }

    return {
        id: String(p.property_id ?? p.propertyId),
        nom: p.title,
        categorie: mapCategory(p.category),
        etat: mapStatus(p.status ?? 'AVAILABLE'),
        description: p.description,
        prix: Number(p.price_amount ?? p.priceAmount),
        localisation: [p.street_name ?? p.streetName, p.city_name ?? p.cityName].filter(Boolean).join(', '),
        latitude: p.latitude ?? 4.05,
        longitude: p.longitude ?? 9.77,
        proprietaireId: String(p.owner_id ?? p.ownerId),
        imageMain: p.image_main ?? p.imageMain ?? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        imagesPieces: imagesPieces ?? [],
        likes: p.likes ?? 0,
        superficie: p.superficie ?? 0,
        chambres: p.chambres ?? 0,
        sallesDeBain: p.salles_de_bain ?? p.sallesDeBain ?? 0,
    };
}

http.get('http://localhost:8080/api/properties', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const array = Array.isArray(json) ? json.map(item => item.data || item) : [];
            const mapped = array.map(mapProperty);
            console.log('Mapped count:', mapped.length);
            console.log('First mapped property:', JSON.stringify(mapped[0], null, 2));
            console.log('Any property with NaN price?', mapped.some(p => isNaN(p.prix)));
            console.log('Any property with undefined ID?', mapped.some(p => p.id === 'undefined'));
        } catch (e) {
            console.error('Error:', e);
        }
    });
});
