import { useEffect, useState } from "react";
import { Navbar } from "../components";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { getPoints, postPoint, deletePoint } from '../services/mapService';
import { useAuth } from "../contexts/AuthContext";
import "./map.css";

const containerStyle = { width: "100%", height: "100%" };
const center = { lat: -28.2620, lng: -52.4083 };

export const Map = () => {
    const { token } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingPoint, setPendingPoint] = useState(null);
    const [nomePonto, setNomePonto] = useState("");
    const [salvando, setSalvando] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        async function fetchMarkers() {
            try {
                const data = await getPoints(token);
                setMarkers(data);
            } catch (error) {
                console.log(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchMarkers();
    }, [token]);

    const handleMapClick = (event) => {
        setPendingPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        setNomePonto("");
        setSelected(null);
    };

    const handleSalvar = async () => {
        if (!nomePonto.trim()) return;
        setSalvando(true);
        try {
            const savedPoint = await postPoint(token, {
                latitude: pendingPoint.lat,
                longitude: pendingPoint.lng,
                descricao: nomePonto,
            });
            setMarkers((prev) => [{
                id: savedPoint.id,
                title: savedPoint.descricao,
                position: { lat: savedPoint.latitude, lng: savedPoint.longitude },
            }, ...prev]);
            setPendingPoint(null);
            setNomePonto("");
        } catch (error) {
            alert(error.message);
        } finally {
            setSalvando(false);
        }
    };

    const handleCancelar = () => {
        setPendingPoint(null);
        setNomePonto("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remover este ponto?")) return;
        try {
            await deletePoint(id);
            setMarkers((prev) => prev.filter((m) => m.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="map-page">
            <Navbar />
            <div className="map-content">
                <aside className="map-sidebar">
                    <div className="sidebar-header">
                        <h2>Meus Pontos</h2>
                        <span className="sidebar-count">{markers.length}</span>
                    </div>
                    <div className="sidebar-list">
                        {loading ? (
                            <p className="sidebar-empty">Carregando...</p>
                        ) : markers.length === 0 ? (
                            <div className="sidebar-empty">
                                <p>🗺️ Nenhum ponto ainda.</p>
                                <p>Clique no mapa para adicionar!</p>
                            </div>
                        ) : (
                            markers.map((marker) => (
                                <div key={marker.id} className="sidebar-item">
                                    <span className="sidebar-item-icon" onClick={() => setSelected(marker)}>📍</span>
                                    <div className="sidebar-item-info" onClick={() => setSelected(marker)}>
                                        <p className="sidebar-item-title">{marker.title}</p>
                                        <p className="sidebar-item-coords">
                                            {marker.position.lat.toFixed(4)}, {marker.position.lng.toFixed(4)}
                                        </p>
                                    </div>
                                    <button className="btn-deletar" onClick={() => handleDelete(marker.id)} title="Remover ponto">
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                <div className="map-container">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={12}
                            onClick={handleMapClick}
                        >
                            {markers.map((marker) => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    title={marker.title}
                                    onClick={() => { setSelected(marker); setPendingPoint(null); }}
                                />
                            ))}
                            {selected && (
                                <InfoWindow position={selected.position} onCloseClick={() => setSelected(null)}>
                                    <div>
                                        <p className="info-window-title">{selected.title}</p>
                                        <p className="info-window-coords">
                                            {selected.position.lat.toFixed(5)}, {selected.position.lng.toFixed(5)}
                                        </p>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="map-loading"><p>Carregando mapa...</p></div>
                    )}

                    {pendingPoint && (
                        <div className="novo-ponto-painel">
                            <p className="novo-ponto-titulo">📍 Novo ponto</p>
                            <p className="novo-ponto-coords">
                                {pendingPoint.lat.toFixed(5)}, {pendingPoint.lng.toFixed(5)}
                            </p>
                            <input
                                className="novo-ponto-input"
                                type="text"
                                placeholder="Nome do local..."
                                value={nomePonto}
                                onChange={(e) => setNomePonto(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
                                autoFocus
                            />
                            <div className="novo-ponto-botoes">
                                <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
                                <button className="btn-salvar" onClick={handleSalvar} disabled={salvando || !nomePonto.trim()}>
                                    {salvando ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};