import React, { useState } from 'react';
import { VirtualTourService, VirtualTourImage } from '../services/virtualTourService';
import { X, Upload, Plus, Trash2, Video, Check } from 'lucide-react';

interface Props {
    bienId: string; // The property id from the frontend string format
    numericId: number; // The actual numeric ID that the backend uses
    onClose: () => void;
    onSuccess: (images: VirtualTourImage[]) => void;
}

interface VTItem {
    file: File | null;
    label: string;
}

export default function VirtualTourUploadModal({ bienId, numericId, onClose, onSuccess }: Props) {
    const [items, setItems] = useState<VTItem[]>([{ file: null, label: 'Salon' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddItem = () => {
        setItems([...items, { file: null, label: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newItems = [...items];
            newItems[index].file = e.target.files[0];
            setItems(newItems);
        }
    };

    const handleLabelChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index].label = val;
        setItems(newItems);
    };

    const handleUpload = async () => {
        try {
            // Validate
            const invalid = items.some(it => !it.file || !it.label.trim());
            if (invalid) {
                setError('Veuillez fournir une image et un libellé pour chaque pièce.');
                return;
            }

            setLoading(true);
            setError('');

            const files = items.map(it => it.file!);
            const labels = items.map(it => it.label.trim());

            const res = await VirtualTourService.uploadVirtualTourImages(numericId, files, labels);
            onSuccess(res);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'upload');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div className="glass-card" style={{ width: 500, maxHeight: '90vh', overflowY: 'auto', padding: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'var(--text-white)', fontSize: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Video className="text-blue-400" /> Visite 360° (ID: {numericId})
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <p style={{ color: 'var(--text-gray)', fontSize: 14 }}>
                    Ajoutez des images panoramiques pour créer la visite virtuelle.
                    <strong> Note: </strong> Le précédent tour virtuel sera remplacé.
                </p>

                {error && (
                    <div style={{ padding: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, fontSize: 13 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {items.map((item, index) => (
                        <div key={index} style={{ border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Image panoramique {index + 1}</span>
                                {items.length > 1 && (
                                    <button onClick={() => handleRemoveItem(index)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Libellé de la pièce (ex: Salon Principal)"
                                value={item.label}
                                onChange={e => handleLabelChange(index, e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-white)', width: '100%' }}
                            />

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={e => handleFileChange(index, e)}
                                    style={{
                                        opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', cursor: 'pointer'
                                    }}
                                />
                                <div style={{
                                    border: '2px dashed var(--border-color)', padding: 16, borderRadius: 8, textAlign: 'center',
                                    background: item.file ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                                    borderColor: item.file ? 'rgba(34,197,94,0.4)' : 'var(--border-color)',
                                    color: item.file ? '#22c55e' : 'var(--text-gray)'
                                }}>
                                    {item.file ? (
                                        <span className="flex items-center justify-center gap-2 font-medium">
                                            <Check size={18} /> {item.file.name}
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-sm">
                                            <Upload size={18} /> Sélectionner un fichier image
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAddItem}
                    style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', border: '1px solid var(--border-color)', borderRadius: 10, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, fontWeight: 600 }}
                >
                    <Plus size={18} /> Ajouter une pièce
                </button>

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '14px', background: 'var(--accent-orange)', color: '#fff', border: 'none', borderRadius: 10,
                        cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, opacity: loading ? 0.7 : 1,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10
                    }}
                >
                    {loading ? '⏳ Traitement en cours...' : (<><Upload size={20} /> Valider l'upload 360°</>)}
                </button>

            </div>
        </div>
    );
}
