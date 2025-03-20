"use client"
import { useSettings } from "@/context/SettingsContext";
export const ToggleHeader = () => {
  const { setisHeadderVisible, isHeadderVisible } = useSettings()

  const handleClick = () => {

    setisHeadderVisible(!isHeadderVisible)
  };

  return (
    <div className="absolute bottom-20 right-2  cursor-pointer" onClick={handleClick} style={{ zIndex: 100 }}>
      <div
        className={`transition-transform duration-300 ease-in-out transform ${isHeadderVisible ? 'rotate-180' : 'rotate-0'}`}
      >
        <object
          data="/toggleheader.svg"
          type="image/svg+xml"
          className="pointer-events-none"
        />
      </div>
    </div>
  );
};