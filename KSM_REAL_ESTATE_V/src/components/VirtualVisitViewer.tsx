'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { VirtualTourImage } from '@/services/virtualTourService';
import '@photo-sphere-viewer/core/index.css';

// Dynamically import the viewer to disable SSR (WebGl/Browser API requirement)
const ReactPhotoSphereViewer = dynamic(
    () => import('react-photo-sphere-viewer').then((mod) => mod.ReactPhotoSphereViewer),
    { ssr: false, loading: () => <div className="h-96 w-full flex items-center justify-center text-gray-500">Chargement de la visite 360°...</div> }
);

interface VirtualVisitViewerProps {
    images: VirtualTourImage[];
}

export default function VirtualVisitViewer({ images }: VirtualVisitViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                Aucune visite virtuelle 360° n'est disponible pour ce bien.
            </div>
        );
    }

    const currentImage = images[currentIndex];
    // Convert relative URL to absolute via API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';
    const imgUrl = currentImage.imageUrl.startsWith('http') ? currentImage.imageUrl : `${API_BASE_URL}${currentImage.imageUrl}`;

    return (
        <div className="virtual-tour-container space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Visite Virtuelle 360°</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {currentImage.roomLabel}
                </span>
            </div>

            <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-2xl border-2 border-white ring-1 ring-gray-900/5">
                {/* @ts-ignore - The types for ReactPhotoSphereViewer are sometimes incomplete for the panorama prop */}
                <ReactPhotoSphereViewer
                    panorama={imgUrl}
                    height="100%"
                    width="100%"
                    navbar={[
                        'autorotate',
                        'zoom',
                        'caption',
                        'fullscreen'
                    ]}
                    caption={currentImage.roomLabel}
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-4 snap-x">
                    {images.map((img, index) => {
                        const thumbUrl = img.imageUrl.startsWith('http') ? img.imageUrl : `${API_BASE_URL}${img.imageUrl}`;
                        return (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`snap-center shrink-0 w-32 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentIndex
                                    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-lg'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={thumbUrl}
                                    alt={img.roomLabel}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs text-center py-1 truncate px-1">
                                    {img.roomLabel}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
