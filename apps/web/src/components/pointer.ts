import { useRef } from "react";

// A "scene click" started on the <canvas> itself (not on the Drei <Html> panel, which lives inside
// the canvas container where R3F listens) and didn't move: orbit drags end with a click too.
export function useSceneClick() {
  const pressAt = useRef({ x: 0, y: 0 });
  return {
    onPointerDown: (event: { clientX: number; clientY: number }) => {
      pressAt.current = { x: event.clientX, y: event.clientY };
    },
    isSceneClick: (event: MouseEvent) =>
      event.target instanceof HTMLCanvasElement &&
      Math.hypot(
        event.clientX - pressAt.current.x,
        event.clientY - pressAt.current.y,
      ) <= 4,
  };
}
