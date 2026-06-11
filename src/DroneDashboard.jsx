

import React, { useState, useEffect, useRef } from 'react';
import socket from "./socketService";
import { MapPin, Camera, AlertTriangle, CheckCircle, Navigation, Loader } from 'lucide-react';



const DroneDashboard = () => {
  const STARTING_LOCATION = { lat: 19.1075, lng: 72.8263, name: 'Vile Parle' };
  
  const [droneStatus, setDroneStatus] = useState({
    battery: 78,
    signal: 'Strong',
    missionTime: 312,
    status: 'En Route'
  });

  const [currentLocation, setCurrentLocation] = useState(STARTING_LOCATION);
  const [destination, setDestination] = useState({ lat: 19.0760, lng: 72.8777 });
  const [destinationInput, setDestinationInput] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [droneData, setDroneData] = useState(null);

  
  
  const [flightData, setFlightData] = useState({
    altitude: 65,
    speed: 42,
    heading: 'NE',
    temp: 47,
    distance: 3.2,
    eta: '4 min 25 sec',
    wind: 'Moderate'
  });

  const [victim, setVictim] = useState({
    detected: true,
    bodyTemp: 36.8,
    confidence: 92,
    lat: 19.0758,
    lng: 72.8772,
    distance: 200
  });

  const [speed, setSpeed] = useState('Medium');
  const [altitude, setAltitude] = useState(60);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const pathLineRef = useRef(null);
  const victimMarkerRef = useRef(null);

// useEffect(() => {
//   socket.on("connect", () => {
//     console.log("✅ Connected to backend socket:", socket.id);
//   });

//   socket.on("droneData", (data) => {
//     console.log("📡 Data received in frontend:", data);

//     setFlightData(prev => ({
//       ...prev,
//       altitude: data.altitude ?? prev.altitude,
//       speed: data.speed ?? prev.speed,
//       temp: data.temp ?? prev.temp,
//       heading: data.heading ?? prev.heading
//     }));
//   });

//   return () => {
//     socket.off("droneData");
//   };
// }, []);
useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection failed:", err.message);
  });

  socket.on("droneData", (data) => {
    // data is now always a JS object — no JSON.parse needed
    console.log("📡 Drone telemetry:", data);

    // Update flight telemetry
    setFlightData(prev => ({
      ...prev,
      altitude: data.altitude  ?? prev.altitude,
      speed:    data.speed     ?? prev.speed,
      temp:     data.temp      ?? prev.temp,
      heading:  data.heading   ?? prev.heading,
      wind:     data.wind      ?? prev.wind,
    }));

    // Update drone status (battery, signal, status)
    setDroneStatus(prev => ({
      ...prev,
      battery: data.battery ?? prev.battery,
      signal:  data.signal  ?? prev.signal,
      status:  data.status  ?? prev.status,
    }));

    // Update victim detection if drone sends it
    if (data.victim) {
      setVictim(prev => ({
        ...prev,
        detected:    data.victim.detected    ?? prev.detected,
        bodyTemp:    data.victim.bodyTemp    ?? prev.bodyTemp,
        confidence:  data.victim.confidence  ?? prev.confidence,
        lat:         data.victim.lat         ?? prev.lat,
        lng:         data.victim.lng         ?? prev.lng,
      }));
    }

    // Update drone position on map if GPS coordinates are sent
    if (data.lat && data.lng && droneMarkerRef.current) {
      const newPos = { lat: data.lat, lng: data.lng };
      droneMarkerRef.current.setPosition(newPos);
      setCurrentLocation(newPos);
      if (pathLineRef.current && destinationMarkerRef.current) {
        pathLineRef.current.setPath([newPos, destinationMarkerRef.current.getPosition()]);
      }
    }
  });

  return () => {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("droneData");
  };
}, []); // ✅ empty deps — refs are stable, no re-subscribe needed


//   useEffect(() => {
//   socket.on("droneData", (message) => {
//     const parsed = JSON.parse(message);

//     setFlightData(prev => ({
//       ...prev,
//       altitude: parsed.altitude ?? prev.altitude,
//       speed: parsed.speed ?? prev.speed,
//       temp: parsed.temp ?? prev.temp,
//       heading: parsed.heading ?? prev.heading
//     }));
//   });

//   return () => socket.off("droneData");
// }, []);


//   useEffect(() => {
//   socket.on("droneData", (message) => {
//     const parsed = JSON.parse(message);
//     setDroneData(parsed);
//   });

//   return () => socket.off("droneData");
// }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setDroneStatus(prev => ({
        ...prev,
        missionTime: prev.missionTime + 1
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: 13,
      mapTypeId: 'satellite',
      styles: [
        {
          featureType: 'all',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    googleMapRef.current = map;

    // Drone marker
    droneMarkerRef.current = new window.google.maps.Marker({
      position: currentLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        rotation: 0
      },
      title: 'Drone'
    });

    // Destination marker
    destinationMarkerRef.current = new window.google.maps.Marker({
      position: destination,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      title: 'Target Location'
    });

    // Victim marker
    victimMarkerRef.current = new window.google.maps.Marker({
      position: { lat: victim.lat, lng: victim.lng },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      title: 'Victim Detected'
    });

    // Path line
    pathLineRef.current = new window.google.maps.Polyline({
      path: [currentLocation, destination],
      geodesic: true,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: map
    });

    setMapLoaded(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const calculateHeading = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  const geocodeLocation = async (locationName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName + ', Mumbai, India')}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const updateFlightData = (newDest) => {
    const dist = calculateDistance(currentLocation.lat, currentLocation.lng, newDest.lat, newDest.lng);
    const heading = calculateHeading(currentLocation.lat, currentLocation.lng, newDest.lat, newDest.lng);
    const speedKmh = speed === 'Fast' ? 60 : speed === 'Medium' ? 42 : 24;
    const etaMinutes = Math.ceil((parseFloat(dist) / speedKmh * 60));
    
    setFlightData(prev => ({
      ...prev,
      distance: dist,
      heading: heading,
      eta: etaMinutes > 60 ? `${Math.floor(etaMinutes/60)}h ${etaMinutes%60}m` : `${etaMinutes} min`
    }));
  };

  const handleSetDestination = async () => {
    if (!destinationInput.trim()) return;
    
    const location = await geocodeLocation(destinationInput);
    if (location) {
      setDestination({ lat: location.lat, lng: location.lng });
      
      updateFlightData(location);
      
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setPosition({ lat: location.lat, lng: location.lng });
      }
      
      if (pathLineRef.current) {
        pathLineRef.current.setPath([currentLocation, { lat: location.lat, lng: location.lng }]);
      }
      
      if (googleMapRef.current) {
        googleMapRef.current.panTo({ lat: location.lat, lng: location.lng });
      }
      
      setDestinationInput('');
    } else {
      alert('Location not found. Please try another location in Mumbai.');
    }
  };

  const moveDrone = () => {
    if (!isMoving || !droneMarkerRef.current) return;

    const currentPos = droneMarkerRef.current.getPosition();
    const destPos = destinationMarkerRef.current.getPosition();
    
    const currentLat = currentPos.lat();
    const currentLng = currentPos.lng();
    const destLat = destPos.lat();
    const destLng = destPos.lng();

    const distance = calculateDistance(currentLat, currentLng, destLat, destLng);
    
    if (parseFloat(distance) < 0.05) {
      setIsMoving(false);
      setDroneStatus(prev => ({ ...prev, status: 'Arrived' }));
      return;
    }

    const speedKmh = speed === 'Fast' ? 60 : speed === 'Medium' ? 42 : 24;
    const step = (speedKmh / 3600) * 0.5;

    const newLat = currentLat + (destLat - currentLat) * step;
    const newLng = currentLng + (destLng - currentLng) * step;
    
    const newPos = { lat: newLat, lng: newLng };
    droneMarkerRef.current.setPosition(newPos);
    setCurrentLocation(newPos);
    
    const heading = calculateHeading(newLat, newLng, destLat, destLng);
    const newDistance = calculateDistance(newLat, newLng, destLat, destLng);
    
    setFlightData(prev => ({
      ...prev,
      heading: heading,
      distance: newDistance
    }));

    if (pathLineRef.current) {
      pathLineRef.current.setPath([newPos, { lat: destLat, lng: destLng }]);
    }

    const bearingAngle = Math.atan2(destLng - newLng, destLat - newLat) * 180 / Math.PI;
    const icon = droneMarkerRef.current.getIcon();
    icon.rotation = bearingAngle;
    droneMarkerRef.current.setIcon(icon);
  };

  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(moveDrone, 500);
      return () => clearInterval(interval);
    }
  }, [isMoving, speed]);

//   Thermal camera
const videoRef = useRef(null);

useEffect(() => {
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  }

  startCamera();
}, []);


  const handleTakeOff = () => {
    setDroneStatus(prev => ({ ...prev, status: 'Taking Off' }));
    setTimeout(() => {
      setDroneStatus(prev => ({ ...prev, status: 'En Route' }));
      setIsMoving(true);
    }, 2000);
  };

  const handleLand = () => {
    setIsMoving(false);
    setDroneStatus(prev => ({ ...prev, status: 'Landing' }));
    setTimeout(() => {
      setDroneStatus(prev => ({ ...prev, status: 'Landed' }));
    }, 2000);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    const speedKmh = newSpeed === 'Fast' ? 60 : newSpeed === 'Medium' ? 42 : 24;
    setFlightData(prev => ({
      ...prev,
      speed: speedKmh
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Navigation className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-bold">DM-DRONE-01</span>
          <span className="text-gray-400">|</span>
          <span className="text-sm">Status: <span className={`${droneStatus.status === 'En Route' ? 'text-green-400' : 'text-yellow-400'}`}>{droneStatus.status}</span></span>
          <span className="text-gray-400">|</span>
          <span className="text-sm">Battery: <span className="text-yellow-400">{droneStatus.battery}%</span></span>
          <span className="text-gray-400">|</span>
          <span className="text-sm">Signal: <span className="text-green-400">{droneStatus.signal}</span></span>
          <span className="text-gray-400">|</span>
          <span className="text-sm">Mission Time: {formatTime(droneStatus.missionTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-60px)]">
        {/* Left Panel */}
        <div className="col-span-3 space-y-4">
          {/* Set Destination */}
          <div className="bg-gray-800 border border-gray-700 rounded p-4">
            <h3 className="text-lg font-bold mb-4">Set Destination</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Starting Location</label>
                <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm">
                  {STARTING_LOCATION.name}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Destination</label>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetDestination()}
                  placeholder="e.g., Andheri, Bandra, Marine Drive..."
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={handleSetDestination}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
              >
                SET DESTINATION
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 border border-gray-700 rounded p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleTakeOff}
                disabled={isMoving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition"
              >
                TAKE OFF
              </button>
              <button
                onClick={handleLand}
                disabled={!isMoving}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded transition"
              >
                LAND
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">Speed</label>
              <div className="flex gap-2">
                {['Slow', 'Medium', 'Fast'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`flex-1 py-2 rounded font-bold transition ${
                      speed === s
                        ? s === 'Fast' ? 'bg-red-600' : s === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Altitude</label>
              <div className="flex gap-2">
                {[60, 80, 100].map((alt) => (
                  <button
                    key={alt}
                    onClick={() => {
                      setAltitude(alt);
                      setFlightData(prev => ({ ...prev, altitude: alt }));
                    }}
                    className={`flex-1 py-2 rounded font-bold transition ${
                      altitude === alt ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {alt}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Info */}
          <div className="bg-gray-800 border border-gray-700 rounded p-4">
            <h3 className="text-lg font-bold mb-3">Mission Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Distance to Target:</span>
                <span className="font-bold">{flightData.distance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ETA:</span>
                <span className="font-bold">{flightData.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wind:</span>
                <span className="text-orange-400 font-bold">{flightData.wind}</span>
              </div>
              <div className="bg-red-900 border border-red-700 rounded px-3 py-2 mt-3">
                <span className="text-yellow-400 font-bold">Weather Alert: High Heat Zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Map View */}
        <div className="col-span-6 relative">
          <div className="bg-gray-800 border border-gray-700 rounded h-full overflow-hidden relative">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-3" />
                  <p className="text-gray-400">Loading Google Maps...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} className="w-full h-full"></div>
            
            {/* Flight Data Overlay */}
            <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 border border-gray-600 rounded px-4 py-3 space-y-1 text-sm">
              <div>Altitude: <span className="text-yellow-400 font-bold">{flightData.altitude}m</span></div>
              <div>Speed: <span className="text-green-400 font-bold">{flightData.speed} km/h</span></div>
              <div>Heading: <span className="text-blue-400 font-bold">{flightData.heading}</span></div>
              <div>Temp: <span className="text-red-400 font-bold">{flightData.temp}°C</span></div>
            </div>

            {/* Alerts */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-orange-600 border border-orange-400 rounded px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">High Heat Zone</span>
              </div>
              <div className="bg-green-600 border border-green-400 rounded px-3 py-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Victim Detected</span>
              </div>
            </div>
          </div>

          {/* Thermal Camera */}
          {/* <div className="absolute bottom-4 left-4 w-80 bg-gray-900 border border-gray-700 rounded overflow-hidden shadow-lg">
            <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700">
              <Camera className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold">Thermal Camera - LIVE</span>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=600&h=300&fit=crop"
                alt="Thermal view"
                className="w-full h-40 object-cover"
                style={{filter: 'hue-rotate(180deg) saturate(2) brightness(0.8)'}}
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-2 py-1 rounded text-xs transition">
                  Zoom +
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-2 py-1 rounded text-xs transition">
                  Zoom -
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 border border-blue-500 px-2 py-1 rounded text-xs transition">
                  Capture
                </button>
              </div>
            </div>
          </div> */}
          {/* Thermal Camera */}
<div className="absolute bottom-4 left-4 w-80 bg-gray-900 border border-gray-700 rounded overflow-hidden shadow-lg">
  <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700">
    <Camera className="w-4 h-4 text-red-500" />
    <span className="text-sm font-bold">Thermal Camera - LIVE</span>
  </div>

  <div className="relative">
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-full h-40 object-cover"
      style={{
        filter: "hue-rotate(200deg) saturate(2.5) contrast(1.2)",
      }}
    />

    <div className="absolute bottom-2 right-2 flex gap-1">
      <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-2 py-1 rounded text-xs">
        Zoom +
      </button>
      <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-2 py-1 rounded text-xs">
        Zoom -
      </button>
      <button className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs">
        Capture
      </button>
    </div>
  </div>
</div>

        </div>

        {/* Right Panel - Victim Detection */}
        <div className="col-span-3">
          <div className="bg-gray-800 border border-gray-700 rounded p-4 h-full">
            <h3 className="text-lg font-bold mb-4">Victim Detection</h3>
            
            {victim.detected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">Human Heat Signature</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Body Temp:</span>
                    <span className="font-bold">{victim.bodyTemp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="font-bold text-green-400">{victim.confidence}%</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Lat:</span>
                      <span className="font-bold text-xs">{victim.lat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lon:</span>
                      <span className="font-bold text-xs">{victim.lng}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition">
                    MARK LOCATION
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition">
                    SEND TO RESCUE TEAM
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No victims detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneDashboard;
