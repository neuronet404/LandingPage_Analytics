"use clinet"
import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from './TextMenu';
import stroke from "@/public/stroke.svg"
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';

const StrokeWidthIcon = () => (
  <Image alt="stroke" src={stroke}/>
);

const ShapeMenu = ({ selectedShape, onShapeUpdate }) => {
  const [strokeColor, setStrokeColor] = useState(selectedShape?.strokeColor || '');
  const [fillColor, setFillColor] = useState(selectedShape?.fillColor || '');
  const [strokeWidth, setStrokeWidth] = useState(selectedShape?.strokeWidth || 2);
  const [opacity, setOpacity] = useState(selectedShape?.opacity || 100);

  // Update local state when selected shape changes
  useEffect(() => {
    if (selectedShape) {
      setStrokeColor(selectedShape.strokeColor || '');
      setFillColor(selectedShape.fillColor || '');
      setStrokeWidth(selectedShape.strokeWidth || 2);
      setOpacity(selectedShape.opacity || 100);
    }
  }, [selectedShape]);

  // Update parent component when any property changes
  useEffect(() => {
    if (selectedShape) {
      onShapeUpdate({
        ...selectedShape,
        strokeColor,
        fillColor,
        strokeWidth,
        opacity
      });
    }
  }, [strokeColor, fillColor, strokeWidth, opacity]);

  // Text constants
  const strokeText = "Stroke";
  const fillText = "Fill";
  const opacityText = "Opacity";

  // Handler functions
  const onStrokeColorChange = (color) => {
    setStrokeColor(color);
  };

  const onFillColorChange = (color) => {
    setFillColor(color);
  };

  const onStrokeWidthChange = (width) => {
    setStrokeWidth(width);
  };

  const onOpacityChange = (value) => {
    setOpacity(value);
  };

  return (
    <div className="bg-white rounded-full shadow-lg py-1.5 px-3 flex items-center gap-3 w-[500px] relative">
      {/* Stroke */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-700 text-xs font-medium">{strokeText}</span>
        <ColorPicker 
          color={strokeColor}
          onChange={onStrokeColorChange}
        />
      </div>

      <div className="h-6 w-px bg-gray-300"/>

      {/* Fill */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-700 text-xs font-medium">{fillText}</span>
        <ColorPicker 
          color={fillColor}
          onChange={onFillColorChange}
        />
      </div>

      <div className="h-6 w-px bg-gray-300"/>

      {/* Stroke Width */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-700 text-xs font-medium">{strokeText}</span>
        <div className="bg-gray-100 rounded-lg px-2 py-0.5 flex items-center gap-1.5">
          <StrokeWidthIcon width={strokeWidth} />
          <span className="text-gray-700 text-xs">{strokeWidth}</span>
        </div>
        <div className="flex gap-1">
          {[1, 3, 5, 9].map((width) => (
            <button 
              key={width}
              className={`w-4 h-4 rounded-full flex items-center justify-center ${strokeWidth === width ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
              onClick={() => onStrokeWidthChange(width)}
            >
              <div 
                className="bg-gray-700 rounded-full" 
                style={{ height: `${Math.min(3, Math.max(1, width/3))}px`, width: '12px' }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="h-6 w-px bg-gray-300"/>

      {/* Opacity */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-gray-700 text-xs font-medium whitespace-nowrap">{opacityText}</span>
        <div className="flex-1 px-2 min-w-0">
          <Slider
            value={[opacity]}
            max={100}
            step={1}
            onValueChange={(value) => onOpacityChange(value[0])}
            className="w-full"
          />
        </div>
        <span className="text-gray-700 text-xs whitespace-nowrap">{opacity}%</span>
      </div>
    </div>
  );
};

export default ShapeMenu;