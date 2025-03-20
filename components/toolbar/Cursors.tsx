import { useToolContext } from '@/context/ToolContext'
import React, { useEffect } from 'react'

const Cursors = ({ fabricCanvas }: { fabricCanvas: any }) => {
    const { selectedTool } = useToolContext();
  
    useEffect(() => {
      if (!fabricCanvas.current) return;
      const canvas = fabricCanvas.current;
  
      // Helper function to set cursor based on the selected tool
      const setCursor = () => {
        return
        switch (selectedTool) {
          case "highlighter":
            canvas.setCursor(
              `url("https://img.icons8.com/?size=20&id=53623&format=png&color=000000") 1 40, auto`
            );
            break;
  
          case "pen":
            canvas.setCursor(
              `url("https://img.icons8.com/?size=30&id=gtYzeXfe2tg5&format=png&color=000000") 1 40, auto`
            );
            break;
  
          case "shapes":
            canvas.setCursor(
              `url("https://img.icons8.com/?size=20&id=32658&format=png&color=000000") 1 1, auto`
            );
            break;
  
          case "text":
            canvas.setCursor(
              `url("https://img.icons8.com/?size=20&id=XA3uAyBFk8kW&format=png&color=000000") 1 40, auto`
            );
            canvas.isDrawingMode = false
            break;
  
          case "rectangleSelection":
            canvas.setCursor(
              `url("https://img.icons8.com/?size=20&id=rKqQiYPTkVLU&format=png&color=000000") 1 1, auto`
            );
            canvas.isDrawingMode = false
            break;
  
          default:
            canvas.setCursor("default");
            break;
        }
      };
  
      // Set the initial cursor when the tool changes
      setCursor();
  
      // Add event listeners for mouse events
      const handleMouseEvents = () => setCursor();
      ["mouse:move", "mouse:down", "mouse:up"].forEach((eventName) =>
        canvas.on(eventName, handleMouseEvents)
      );
  
      // Cleanup event listeners on component unmount or dependency change
      return () => {
        ["mouse:move", "mouse:down", "mouse:up"].forEach((eventName) =>
          canvas.off(eventName, handleMouseEvents)
        );
      };
    }, [fabricCanvas, selectedTool]);
  
    return null;
  };
  
  export default Cursors;