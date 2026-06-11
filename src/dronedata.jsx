// import { useEffect, useState } from "react";
// import socket from "./socketservice";

// function DroneData() {

//   const [data, setData] = useState(null);

//   useEffect(() => {

//     socket.on("connect", () => {
//       console.log("✅ Connected to backend:", socket.id);
//     });

//     socket.on("droneData", (message) => {
//       console.log("📡 Received in DroneData component:", message);

//       const parsed = JSON.parse(message);
//       setData(parsed);
//     });

//     return () => {
//       socket.off("droneData");
//     };

//   }, []);

//   return (
//     <div>
//       <h2>Drone Test Data</h2>

//       {data ? (
//         <div>
//           <p>Altitude: {data.altitude}</p>
//           <p>Speed: {data.speed}</p>
//           <p>Temperature: {data.temp}</p>
//           <p>Heading: {data.heading}</p>
//         </div>
//       ) : (
//         <p>No Data Yet...</p>
//       )}

//     </div>
//   );
// }

// export default DroneData;

import { useEffect, useState } from "react";
import socket from "./socketService";

function DroneData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to backend:", socket.id);
    });

    socket.on("droneData", (message) => {
      console.log("📡 Received in DroneData component:", message);
      setData(message); // ✅ already an object — no JSON.parse needed
    });

    return () => {
      socket.off("connect");
      socket.off("droneData");
    };
  }, []);

  return (
    <div>
      <h2>Drone Test Data</h2>
      {data ? (
        <div>
          <p>Altitude: {data.altitude}</p>
          <p>Speed: {data.speed}</p>
          <p>Temperature: {data.temp}</p>
          <p>Heading: {data.heading}</p>
        </div>
      ) : (
        <p>No data yet...</p>
      )}
    </div>
  );
}

export default DroneData;