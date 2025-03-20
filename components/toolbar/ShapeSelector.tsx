"use client";
import React, { useEffect, useState } from "react";
import {
  Diamond,
  Triangle,
  Circle,
  Square,
  ArrowUpRight,
  Minus,
  MousePointer,
  Hand,
  GrabIcon,
} from "lucide-react";
import ShapeMenu from "./ShapeMenu";
import { useSettings } from "@/context/SettingsContext";

const ShapeButton = ({ Icon, isSelected, onClick }) => (
  <button
    className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
      isSelected ? "bg-gray-100" : ""
    }`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4 text-gray-700" />
  </button>
);


// Main component
const ShapeSelector = () => {
  const { activeTool, setActiveTool, setScrollPdf, scrollPdf } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  
  // Initialize shapes with default properties
  const [shapes, setShapes] = useState([
    {
      id: "rectangleSelection",
      icon: MousePointer,
      strokeColor: "",
      strokeWidth: 2,
      opacity: 100,
      fillColor: ""
    },
    {
      id: "diamond",
      icon: Diamond,
      strokeColor: "",
      strokeWidth: 2,
      opacity: 100,
      fillColor: ""
    },
    {
      id: "circle",
      icon: Circle,
      strokeColor: "",
      strokeWidth: 2,
      opacity: 100,
      fillColor: ""
    },
    {
      id: "rectangle",
      icon: Square,
      strokeColor: "",
      strokeWidth: 2,
      opacity: 100,
      fillColor: ""
    },
    {
      id: "arrow",
      icon: ArrowUpRight,
      strokeColor: "",
      strokeWidth: 2,
      opacity: 100,
      fillColor: ""
    },
    {
      id: "line",
      icon: Minus,
      strokeColor: "",
      strokeWidth: 2,
      opacity: 100,
      fillColor: ""
    }
  ]);

  // Handle shape selection
  const handleShapeClick = (shape) => {
    setSelectedShape(shape);
    setActiveTool(shape);
    setMenuOpen(true);
  };

  // Update shape properties
  const handleShapeUpdate = (updatedShape) => {
    setShapes(prevShapes => 
      prevShapes.map(shape => 
        shape.id === updatedShape.id ? updatedShape : shape
      )
    );
    setActiveTool(updatedShape);
  };

  // Store shapes in localStorage to persist across renders
  useEffect(() => {
    const storedShapes = localStorage.getItem('shapesConfig');
    if (storedShapes) {
      try {
        const parsedShapes = JSON.parse(storedShapes);
        // We need to restore the icon function references
        const restoredShapes = parsedShapes.map(shape => {
          const iconMap = {
            "rectangleSelection": MousePointer,
            "diamond": Diamond,
            "circle": Circle,
            "rectangle": Square,
            "arrow": ArrowUpRight,
            "line": Minus
          };
          return { ...shape, icon: iconMap[shape.id] || MousePointer };
        });
        setShapes(restoredShapes);
      } catch (error) {
        console.error("Error parsing stored shapes:", error);
      }
    }
  }, []);

  // Save shapes configuration when it changes
  useEffect(() => {
    // We need to remove the icon function before storing
    const shapesForStorage = shapes.map(({ icon, ...rest }) => rest);
    localStorage.setItem('shapesConfig', JSON.stringify(shapesForStorage));
  }, [shapes]);

  return (
    <div className="relative">
      <div className="bg-white rounded-full py-1.5 px-2 flex items-center gap-1 w-fit">
        {shapes.map((shape) => (
          <ShapeButton
            key={shape.id}
            Icon={shape.icon}
            isSelected={selectedShape?.id === shape.id}
            onClick={() => handleShapeClick(shape)}
          />
        ))}
        <ShapeButton
          key="hand"
          Icon={Hand}
          isSelected={!selectedShape && scrollPdf}
          onClick={() => {
            setSelectedShape(null);
            setScrollPdf(!scrollPdf);
            setMenuOpen(false);
          }}
        />
      </div>
      
      {menuOpen && selectedShape && (
        <div className="absolute -top-10">
          <ShapeMenu 
            selectedShape={selectedShape} 
            onShapeUpdate={handleShapeUpdate} 
          />
          {/* Pointer */}
          <div className="absolute w-3 h-3 bg-white rotate-45 -bottom-1.5 left-1/2 transform -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default ShapeSelector;
