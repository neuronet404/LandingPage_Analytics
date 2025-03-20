"use client";
import { useSettings } from "@/context/SettingsContext";
import React, { useState, useEffect, useRef, useCallback } from "react";


export const TwoFingerScroll = () => {
  let lastTouchY = 0;
  let lastTouchX = 0;
  let isTwoFingerTouch = false;
  const [data, setdata] = useState("");
  const { setScrollPdf } = useSettings();

  useEffect(() => {
    const scrollPad = document.getElementById("scrollPad");
    const scrollableElement = document.querySelector(".scrollableElement");

    if (!scrollPad || !scrollableElement) return;

    const handleTouchStart = (event) => {
      console.log("Touch start detected", event.touches.length);
      setdata(`Touch start detected, ${event.touches.length}`);

      if (event.touches.length === 2) {
        isTwoFingerTouch = true;
        lastTouchY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        lastTouchX = (event.touches[0].clientX + event.touches[1].clientX) / 2;

        console.log("Two-finger touch started at", lastTouchX, lastTouchY);

        setScrollPdf(true);
        setTimeout(() => setScrollPdf(false), 1000);
      } else {
        isTwoFingerTouch = false;
      }
    };

    const handleTouchMove = (event) => {
      if (isTwoFingerTouch && event.touches.length === 2) {
        event.preventDefault();

        let currentTouchY =
          (event.touches[0].clientY + event.touches[1].clientY) / 2;
        let currentTouchX =
          (event.touches[0].clientX + event.touches[1].clientX) / 2;

        let deltaY = currentTouchY - lastTouchY;
        let deltaX = currentTouchX - lastTouchX;

        console.log(
          "Touch move detected: deltaX =",
          deltaX,
          "deltaY =",
          deltaY
        );

        // Now scrolling `.scrollableElement` instead of `scrollPad`
        // scrollableElement.scrollBy(-deltaX, -deltaY);

        lastTouchY = currentTouchY;
        lastTouchX = currentTouchX;
      }
    };

    const handleTouchEnd = () => {
      console.log("Touch end detected");
      setdata("Touch end detected");
      isTwoFingerTouch = false;
    };

    scrollPad.addEventListener("touchstart", handleTouchStart);
    scrollPad.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    scrollPad.addEventListener("touchend", handleTouchEnd);

    return () => {
      scrollPad.removeEventListener("touchstart", handleTouchStart);
      scrollPad.removeEventListener("touchmove", handleTouchMove);
      scrollPad.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
  null
  );
};
