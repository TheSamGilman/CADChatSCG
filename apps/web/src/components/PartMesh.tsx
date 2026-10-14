import type { Part } from "@cadchatscg/shared/parts";
import { useCursor } from "@react-three/drei";
import { useState } from "react";
import { ReviewPanel } from "./ReviewPanel.tsx";

type PartMeshProps = {
  part: Part;
  position: [number, number, number];
  selected: boolean;
  onSelect: (partId: string, event: MouseEvent) => void;
};

export function PartMesh({
  part,
  position,
  selected,
  onSelect,
}: PartMeshProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <mesh> is a Three.js object, not a DOM element.
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(part.id, event.nativeEvent);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={selected ? "#0284c7" : "#38bdf8"} />
      {selected && <ReviewPanel part={part} />}
    </mesh>
  );
}
