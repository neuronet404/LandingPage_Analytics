'use client';
import { useRef, useState } from "react";

export const TwoFingerScroll = ({ children }) => {
  const containerRef = useRef(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [scrollStartPosition, setScrollStartPosition] = useState(null);
  const [state, setState] = useState("");

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      
      // Calculate the middle point between the two fingers
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const midPointY = (touch1.clientY + touch2.clientY) / 2;
      
      setTouchStartY(midPointY);
      setScrollStartPosition(containerRef.current?.scrollTop || 0);
      setState("Two-finger touch started");
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      
      const container = containerRef.current;
      if (!container || touchStartY === null || scrollStartPosition === null) return;

      // Calculate current middle point
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentMidPointY = (touch1.clientY + touch2.clientY) / 2;
      
      // Calculate the distance moved
      const deltaY = touchStartY - currentMidPointY;
      
      // Update scroll position
      container.scrollTop = scrollStartPosition + deltaY;
      
      setState(`Scrolling: ${deltaY.toFixed(2)}px`);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
    setScrollStartPosition(null);
    setState("");
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        height: "100%",
        width: "100%",
        overflow: "auto",
        touchAction: "pan-y", // Allow horizontal scrolling but disable vertical
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      {/* <div className="fixed top-4 left-4 bg-black/50 text-white p-2 rounded">
        {state}
      </div> */}
    </div>
  );
};