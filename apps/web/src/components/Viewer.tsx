import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { useParts } from "../hooks/useParts.ts";
import { PartMesh } from "./PartMesh.tsx";
import { useSceneClick } from "./pointer.ts";

const SPACING = 2;

export function Viewer() {
  const { data: parts, error } = useParts();
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const { onPointerDown, isSceneClick } = useSceneClick();

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        onPointerDown={onPointerDown}
        onPointerMissed={(event) => {
          if (isSceneClick(event)) {
            setSelectedPartId(null);
          }
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        {parts?.map((part, index) => (
          <PartMesh
            key={part.id}
            part={part}
            position={[(index - (parts.length - 1) / 2) * SPACING, 0, 0]}
            selected={part.id === selectedPartId}
            onSelect={(partId, event) => {
              if (isSceneClick(event)) {
                setSelectedPartId(partId);
              }
            }}
          />
        ))}
        <OrbitControls makeDefault />
      </Canvas>
      {error && (
        <p className="absolute top-4 left-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn't load parts: {error.message}
        </p>
      )}
    </div>
  );
}
