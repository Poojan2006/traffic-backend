import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const AnalyticsMap = ({ violations }) => {
    // Parse valid coordinates from "Lat, Lng" formatted locations
    const validPoints = useMemo(() => {
        return violations.filter(v => v.location && v.location.includes(',')).map(v => {
            const parts = v.location.split(',');
            return {
                ...v,
                lat: parseFloat(parts[0].trim()),
                lng: parseFloat(parts[1].trim())
            };
        }).filter(v => !isNaN(v.lat) && !isNaN(v.lng));
    }, [violations]);

    // Default center for Hyderabad if no active hotspots
    const centerLat = validPoints.length > 0 ? (validPoints.reduce((acc, p) => acc + p.lat, 0) / validPoints.length) : 17.3850;
    const centerLng = validPoints.length > 0 ? (validPoints.reduce((acc, p) => acc + p.lng, 0) / validPoints.length) : 78.4867;

    return (
        <div style={{ height: '320px', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
            <MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {validPoints.map((p, idx) => (
                    <CircleMarker
                        key={p.id || idx}
                        center={[p.lat, p.lng]}
                        radius={7}
                        fillColor="var(--primary)"
                        color="var(--primary)"
                        weight={2}
                        opacity={0.9}
                        fillOpacity={0.6}
                    >
                        <Popup>
                            <strong>{p.status}</strong><br/>
                            {p.vehicleNo ? `Vehicle: ${p.vehicleNo}` : 'Civilian Report'}<br/>
                            {new Date(p.createdAt).toLocaleDateString()}
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default AnalyticsMap;
