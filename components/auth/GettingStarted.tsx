"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Image from "next/image";

const AcolyteCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const cards = [
    {
      title: "Create To-Do list with your friends",
      subtitle: "Enter the task and tag your friends to help you finish them",
      button: "Next",
      isInput: false
    },
    {
      title: "Student Progress Tracker",
      subtitle: "",
      options: [
        { label: "Total Hours spent", checked: true },
        { label: "Average hours spent on a single subject", checked: false },
        { label: "Friends You've collaborated with", checked: true },
        { label: "Total number of notes taken down", checked: false }
      ],
      button: "Skip",
      isInput: false
    },
    {
      title: "Collaborative study",
      subtitle: "Collaborate with friends, create a virtual study group",
      label: "Invite Friends",
      placeholder: "Enter your email address",
      button: "Skip",
      isInput: true,
      step: "1/3"
    },
    {
      title: "Revolutionizing Medical Education with AI",
      subtitle: "",
      button: "Next",
      isInput: false
    }
  ];
  
  const handlePrevious = () => {
    setActiveSlide((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveSlide((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full ">
      <div className="relative w-full max-w-md  rounded-2xl shadow-md overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center py-8">
        <Image
              src={"/acolytelogo.svg"}
              alt="logo"
              className="object-contain"
              width={100}
              height={100}
            />
        </div>
        
        {/* Card Content */}
        <div className="px-8 pb-12">
          <div className="transition-all duration-300 transform" style={{ height: '250px' }}>
            {/* Card 1: To-Do List */}
            {activeSlide === 0 && (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">{cards[0].title}</h2>
                <p className="text-gray-500 text-center mb-8">{cards[0].subtitle}</p>
                <div className="flex justify-between w-full mt-16">
                  <button onClick={handlePrevious} className="text-purple-800 flex items-center">
                    <ChevronLeft size={20} />
                    <span>Previous</span>
                  </button>
                  <button onClick={handleNext} className="text-purple-800 flex items-center">
                    <span>Next</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Card 2: Student Progress Tracker */}
            {activeSlide === 1 && (
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">{cards[1].title}</h2>
                <div className="space-y-4 mb-8">
                  {cards[1].options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-5 h-5 border rounded flex items-center justify-center ${option.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {option.checked && <span className="text-white">✓</span>}
                      </div>
                      <span className="ml-3 text-gray-500">{option.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between w-full mt-8">
                  <button onClick={handlePrevious} className="text-purple-800 flex items-center">
                    <ChevronLeft size={20} />
                    <span>Previous</span>
                  </button>
                  <button onClick={handleNext} className="text-purple-800 flex items-center">
                    <span>Skip</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Card 3: Collaborative Study */}
            {activeSlide === 2 && (
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-purple-800 mb-2 text-center">{cards[2].title}</h2>
                <p className="text-gray-500 text-center mb-8">{cards[2].subtitle}</p>
                <div className="mt-2">
                  <label className="block text-center mb-2 text-purple-800">{cards[2].label}</label>
                  <div className="flex border rounded-md">
                    <input type="text" placeholder={cards[2].placeholder} className="flex-grow p-2 outline-none" />
                    <button className="bg-white p-2">
                      <ArrowRight size={20} className="text-purple-800" />
                    </button>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">{cards[2].step}</div>
                </div>
                <div className="flex justify-between w-full mt-6">
                  <button onClick={handlePrevious} className="text-purple-800 flex items-center">
                    <ChevronLeft size={20} />
                    <span>Previous</span>
                  </button>
                  <button onClick={handleNext} className="text-purple-800 flex items-center">
                    <span>Skip</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Card 4: Medical Education */}
            {activeSlide === 3 && (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">{cards[3].title}</h2>
                <div className="flex justify-end w-full mt-32">
                  <button onClick={handleNext} className="text-purple-800 flex items-center">
                    <span>Next</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center pb-8 space-x-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSlide === index ? 'bg-purple-600 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcolyteCarousel;