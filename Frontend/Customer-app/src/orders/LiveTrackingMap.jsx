import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography } from "@mui/material";
import { io } from "socket.io-client";

// Custom HTML Markers for Leaflet
const createIcon = (color, label) =>
  new L.DivIcon({
    className: "custom-marker-icon",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

// Premium SVG Bike Icon for Delivery Partner
const bikeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19 5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1h14V5zm-2.88 4H7.88L6 14.54V21h2v-2h8v2h2v-6.46L16.12 9zM9 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`;
const partnerIcon = new L.DivIcon({
  className: "delivery-partner-icon",
  html: `<div style="background-color: #2196F3; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 6px 12px rgba(33,150,243,0.4); display: flex; align-items: center; justify-content: center;">${bikeSvg}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -25],
});

const storeIcon = createIcon("#6C5DD3", "🏪");
const customerIcon = createIcon("#4CAF50", "📍");

// Auto-adjust map bounds when partner moves
const MapUpdater = ({ partnerLocation, customerLocation, storeLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    const points = [];
    if (partnerLocation) points.push([partnerLocation.lat, partnerLocation.lng]);
    if (customerLocation) points.push([customerLocation.lat, customerLocation.lng]);
    if (storeLocation && !partnerLocation) points.push([storeLocation.lat, storeLocation.lng]); // Only bound store if partner isn't live yet

    if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50], animate: true });
    } else if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    }
  }, [partnerLocation, customerLocation, storeLocation, map]);
  
  return null;
};

export default function LiveTrackingMap({ orderId, storeLocation, customerLocation, partnerId, orderStatus }) {
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  
  // Default center based on customer or store, or fallback
  const defaultCenter = customerLocation || storeLocation || { lat: 23.1852, lng: 77.0180 };

  const isPickedUp = ["PICKED_UP", "HEADING_TO_CUSTOMER", "REACHED_LOCATION"].includes(orderStatus);

  useEffect(() => {
    if (!partnerId) return;
    const fetchPartnerDetails = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:3000/api/v1/users/internal/${partnerId}`);
        const data = await res.json();
        if (data.success && data.profile) {
          setPartnerDetails(data.profile);
        }
      } catch (err) {
        console.error("Failed to fetch delivery partner details:", err);
      }
    };
    fetchPartnerDetails();
  }, [partnerId]);

  useEffect(() => {
    if (!orderId) return;

    const socket = io("http://localhost:3009");

    socket.on("connect", () => {
      console.log("Connected to tracking socket for order:", orderId);
      socket.emit("joinOrderTrack", orderId);
    });

    socket.on("partnerLocationUpdated", (data) => {
      console.log("📍 Partner Location Update:", data);
      if (data.lat && data.lng) {
        setPartnerLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socket.emit("leaveOrderTrack", orderId);
      socket.disconnect();
    };
  }, [orderId]);

  return (
    <Box sx={{ height: 350, width: "100%", borderRadius: 3, overflow: "hidden", position: "relative", zIndex: 1, border: "1px solid", borderColor: "divider" }}>
      
      {/* Partner Info Overlay */}
      {partnerDetails && (
        <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 1000, bgcolor: "background.paper", p: 1.5, borderRadius: 2, boxShadow: 3, display: "flex", flexDirection: "column" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>DELIVERY PARTNER</Typography>
          <Typography variant="body2" fontWeight={800}>{partnerDetails.fullName || "Partner"}</Typography>
          <Typography variant="body2" color="primary" fontWeight={700}>📞 {partnerDetails.phone || "N/A"}</Typography>
        </Box>
      )}

      <MapContainer center={defaultCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Customer Location */}
        {customerLocation && (
          <Marker position={customerLocation} icon={customerIcon}>
            <Popup><Typography variant="subtitle2" fontWeight={700}>Your Delivery Address</Typography></Popup>
          </Marker>
        )}

        {/* Store Location */}
        {storeLocation && (
          <Marker position={storeLocation} icon={storeIcon}>
            <Popup><Typography variant="subtitle2" fontWeight={700}>Store Location</Typography></Popup>
          </Marker>
        )}

        <MapUpdater partnerLocation={partnerLocation} customerLocation={customerLocation} storeLocation={storeLocation} />

        {/* Route Line (Blue) - ONLY AFTER PICKUP */}
        {isPickedUp && partnerLocation && customerLocation ? (
          <Polyline 
            positions={[[partnerLocation.lat, partnerLocation.lng], [customerLocation.lat, customerLocation.lng]]} 
            color="#2196F3" 
            weight={4} 
            dashArray="10, 10"
            opacity={0.7}
          />
        ) : (!isPickedUp && storeLocation && customerLocation && (
          <Polyline 
            positions={[[storeLocation.lat, storeLocation.lng], [customerLocation.lat, customerLocation.lng]]} 
            color="#9E9E9E" 
            weight={3} 
            dashArray="5, 10"
            opacity={0.5}
          />
        ))}

        {/* Delivery Partner Location */}
        {partnerLocation && (
          <Marker position={partnerLocation} icon={partnerIcon}>
            <Popup>
              <Typography variant="subtitle2" fontWeight={700}>Delivery Partner</Typography>
              {partnerDetails && <Typography variant="caption">{partnerDetails.fullName}</Typography>}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </Box>
  );
}
