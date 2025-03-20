import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ColorPicker = ({ onChange }) => {
  const [color, setColor] = useState("black");
  return (
    <div className="relative inline-block">
      {/* Gradient ring container */}
      <div className="w-6 h-6 rounded-full p-0.5 relative animate-spin-slow bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">
        {/* Inner container for color picker */}
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          {/* Color input */}
          <input
            type="color"
            value={color}
            onChange={(e) => {onChange(e.target.value); setColor(e.target.value)}}
            className="w-full h-full opacity-0 absolute cursor-pointer z-10"
          />
          {/* Color display */}
          <div
            className="w-4 h-4 rounded-full cursor-pointer"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
};

const TextMenu = () => {
  const [fontSize, setFontSize] = useState("3");
  const [fontFamily, setFontFamily] = useState("Roboto");
  const [fontWeight, setFontWeight] = useState("Bold");
  const onStrokeColorChange = (color: string) => {
    console.log(color);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-full py-1.5 px-3 flex items-center gap-4">
        {/* Color */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 text-xs">Color</span>
          <ColorPicker onChange={onStrokeColorChange} />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200" />

        {/* Size */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 text-xs">Size</span>
          <div className="bg-gray-100 rounded px-1.5 py-0.5 flex items-center gap-1">
            <span className="text-gray-600 text-xs">T</span>
            <span className="text-gray-700 text-xs font-medium">
              {fontSize}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200" />

        {/* Font */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 text-xs">Font</span>
          <div className="flex gap-1.5">
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="bg-gray-100 border-0 h-6 text-xs px-2 w-20">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fontWeight} onValueChange={setFontWeight}>
              <SelectTrigger className="bg-gray-100 border-0 h-6 text-xs px-2 w-16">
                <SelectValue placeholder="Weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute w-3 h-3 bg-white rotate-45 -bottom-1.5 right-8 shadow-xl" />
    </div>
  );
};

export default TextMenu;
