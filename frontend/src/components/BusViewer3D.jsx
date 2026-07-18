import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Placeholder de Bus (Formas básicas)
const BusPrueba = ({ alSeleccionarParte }) => {
  const grupo = useRef();

  // Función genérica para manejar clic en partes
  const manejarClic = (e, nombreParte) => {
    e.stopPropagation(); // Evitar clics múltiples
    alSeleccionarParte(nombreParte);
  };

  return (
    <group ref={grupo} dispose={null}>
      {/* Carrocería principal */}
      <mesh position={[0, 1.5, 0]} onClick={(e) => manejarClic(e, 'carroceria')}>
        <boxGeometry args={[2.5, 1.5, 6]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Parabrisas */}
      <mesh position={[0, 1.8, 3.01]} onClick={(e) => manejarClic(e, 'parabrisas_delantero')}>
        <planeGeometry args={[2.3, 0.8]} />
        <meshStandardMaterial color="#00ffff" transparent opacity={0.6} />
      </mesh>

      {/* Ruedas */}
      {[[-1.2, 0.5, 2], [1.2, 0.5, 2], [-1.2, 0.5, -2], [1.2, 0.5, -2]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]} onClick={(e) => manejarClic(e, `rueda_${i}`)}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* Parachoques Frontal */}
      <mesh position={[0, 0.7, 3.1]} onClick={(e) => manejarClic(e, 'parachoques_frontal')}>
        <boxGeometry args={[2.6, 0.4, 0.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
};

const BusViewer3D = ({ alSeleccionarParte }) => {
  return (
    <div style={{ width: '100%', height: '400px', background: '#222', borderRadius: '10px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [5, 4, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        
        <BusPrueba alSeleccionarParte={alSeleccionarParte} />
        
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default BusViewer3D;
