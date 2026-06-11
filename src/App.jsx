import React from "react";
import DroneDashboard from "./DroneDashboard";
import dronedata from "./dronedata";

function App() {
  return (
    <div className="min-h-screen bg-[#0b1220]">
      <DroneDashboard />
      <dronedata />
    </div>
  );
}

export default App;

