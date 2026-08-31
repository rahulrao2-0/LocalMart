import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import NearMeIcon from "@mui/icons-material/NearMe";
import StarIcon from "@mui/icons-material/Star";
import StorefrontIcon from "@mui/icons-material/StorefrontRounded";

// Default coordinates: Kothri Kalan, Sehore, MP, India
const DEFAULT_CENTER = { lat: 23.1852, lng: 77.0180 };

// Haversine distance calculator in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Initial nearby shops with real MP coordinates (Kothri Kalan, Sehore, Bhopal, Ashta)
export const initialShops = [];

// Custom HTML Markers for Leaflet
const createUserIcon = () =>
  L.divIcon({
    className: "user-map-pin",
    html: `<div style="
      width: 24px;
      height: 24px;
      background: #6C5DD3;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(108,93,211,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    "><div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

const createShopIcon = (isOpen, isSelected) =>
  L.divIcon({
    className: "shop-map-pin",
    html: `<div style="
      background: ${isSelected ? '#FF7551' : isOpen ? '#2e7d32' : '#757575'};
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      border: 2px solid white;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    ">🏪 ${isOpen ? 'OPEN' : 'CLOSED'}</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 24]
  });

// Map Controller for smooth pans
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LocalNeighborhoodMap({
  themeMode,
  selectedShop,
  onSelectShop,
  onHoverShop
}) {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [activeShop, setActiveShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(DEFAULT_CENTER);
  const [userAddress, setUserAddress] = useState("Kothri Kalan, Sehore, MP");

  // Fetch shops from backend and calculate distances
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/sellers/all");
        const result = await response.json();
        
        if (result.success && result.data) {
          const backendShops = result.data.map((seller) => {
            const lat = seller.location?.lat || 23.1852 + (Math.random() - 0.5) * 0.1;
            const lng = seller.location?.lng || 77.0180 + (Math.random() - 0.5) * 0.1;
            const dist = calculateDistance(userPos.lat, userPos.lng, lat, lng);
            
            return {
              id: seller.authUserId || seller._id,
              name: seller.businessName || "Local Shop",
              category: seller.businessType || "Retail",
              rating: 4.5,
              isOpen: true,
              address: seller.addressLine1 || "LocalMart Address",
              phone: seller.phone || "N/A",
              lat,
              lng,
              distanceKm: parseFloat(dist.toFixed(1))
            };
          }).sort((a, b) => a.distanceKm - b.distanceKm);
          
          setShops(backendShops);
          
          if (backendShops.length > 0) {
            setMapCenter({ lat: backendShops[0].lat, lng: backendShops[0].lng });
          }
        }
      } catch (error) {
        console.error("Failed to fetch shops for map:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShops();
  }, [userPos]); // Refetch/recalculate if userPos changes (simplified approach)

  const [locating, setLocating] = useState(false);

  // Handle Locate Me (GPS)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(newPos);
        setUserAddress("Your Current Live Location");
        setLocating(false);
      },
      (err) => {
        console.warn("GPS error, using Kothri Kalan fallback:", err.message);
        setUserPos(DEFAULT_CENTER);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const tileUrl =
    themeMode === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const selectedShopObj = shops.find((s) => s.id === selectedShop?.id || s.name === selectedShop?.name);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.02)"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MapOutlinedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={800}>
            Live Neighborhood Map
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Locate my position (GPS)">
            <IconButton
              size="small"
              color="primary"
              onClick={handleLocateMe}
              disabled={locating}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              {locating ? <CircularProgress size={16} /> : <GpsFixedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {selectedShopObj && (
            <Button
              size="small"
              variant="text"
              color="secondary"
              onClick={() => onSelectShop(null)}
              sx={{ p: 0, minWidth: 0, fontWeight: 700 }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Box>

      {/* Interactive Map Box */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 340, sm: 400, md: 480 },
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <MapContainer
          center={[userPos.lat, userPos.lng]}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <MapViewController center={userPos} zoom={selectedShopObj ? 13 : 11} />
          <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap" />

          {/* User Location Marker */}
          <Marker position={[userPos.lat, userPos.lng]} icon={createUserIcon()}>
            <Popup>
              <Typography variant="subtitle2" fontWeight={800}>
                📍 YOU ARE HERE
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userAddress}
              </Typography>
            </Popup>
          </Marker>

          {/* Shop Markers */}
          {shops.map((shop) => {
            const isSelected = selectedShopObj?.name === shop.name;

            return (
              <React.Fragment key={shop.id}>
                <Marker
                  position={[shop.lat, shop.lng]}
                  icon={createShopIcon(shop.isOpen, isSelected)}
                  eventHandlers={{
                    click: () => onSelectShop(shop),
                    mouseover: () => onHoverShop(shop),
                    mouseout: () => onHoverShop(null)
                  }}
                >
                  <Popup>
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                        {shop.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {shop.address}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                        <Chip
                          size="small"
                          label={`${shop.distanceKm} km away`}
                          color="primary"
                          sx={{ height: 18, fontSize: 9, fontWeight: 800 }}
                        />
                        <Chip
                          size="small"
                          label={`${shop.rating} ★`}
                          color="warning"
                          sx={{ height: 18, fontSize: 9, fontWeight: 800 }}
                        />
                      </Stack>
                    </Box>
                  </Popup>
                </Marker>

                {/* Draw Route Line if selected */}
                {isSelected && (
                  <Polyline
                    positions={[
                      [userPos.lat, userPos.lng],
                      [shop.lat, shop.lng]
                    ]}
                    color="#FF7551"
                    weight={4}
                    dashArray="6, 8"
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Live Location Tag overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            zIndex: 1000,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(6px)",
            color: "#111",
            py: 0.5,
            px: 1.5,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
          <Typography variant="caption" fontWeight={700}>
            {userAddress}
          </Typography>
        </Box>
      </Box>

      {/* Interactive List of Stores */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: "block" }}>
          NEARBY STORES (AUTOMATICALLY SORTED BY DISTANCE):
        </Typography>
        <Stack spacing={1} sx={{ maxHeight: 180, overflowY: "auto", pr: 0.5 }}>
          {shops.map((shop) => {
            const isSelected = selectedShopObj?.name === shop.name;

            return (
              <Box
                key={shop.id}
                onMouseEnter={() => onHoverShop(shop)}
                onMouseLeave={() => onHoverShop(null)}
                onClick={() => onSelectShop(shop)}
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "primary.50" : "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "primary.light", transform: "translateX(4px)" }
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <StorefrontIcon color={isSelected ? "primary" : "action"} fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 180 }}>
                      {shop.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {shop.category} · {shop.address.split(",")[0]}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Chip
                    size="small"
                    label={`${shop.distanceKm} km`}
                    color={shop.distanceKm < 10 ? "success" : "default"}
                    sx={{ height: 20, fontSize: 10, fontWeight: 800 }}
                  />
                  <Chip
                    size="small"
                    label={shop.isOpen ? "Open" : "Closed"}
                    color={shop.isOpen ? "success" : "default"}
                    variant={shop.isOpen ? "filled" : "outlined"}
                    sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                  />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
