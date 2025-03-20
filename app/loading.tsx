export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
      <div className="relative flex flex-col items-center">
        {/* Custom loader that matches Acolyte logo colors */}
        <div className="w-20 h-20 relative">
          {/* Purple arc (A shape) */}
          <div className="absolute inset-0 border-t-4 border-l-4 border-[#5A3999] rounded-full animate-spin"></div>
          {/* Green arc (C shape) - opposite direction */}
          <div className="absolute inset-0 border-b-4 border-r-4 border-[#38A169] rounded-full animate-spin-reverse"></div>
        </div>
        
        {/* Acolyte text below the spinner */}
        <div className="mt-4 text-[#5A3999] font-semibold text-lg">
          ACOLYTE
        </div>
      </div>
    </div>
  );
}
export function TrainLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-transparent">
      <div className="relative flex flex-col items-center">
        {/* Custom loader that matches Acolyte logo colors */}
        <div className="w-20 h-20 relative">
          {/* Purple arc (A shape) */}
          <div className="absolute inset-0 border-t-4 border-l-4 border-[#5A3999] rounded-full animate-spin"></div>
          {/* Green arc (C shape) - opposite direction */}
          <div className="absolute inset-0 border-b-4 border-r-4 border-[#38A169] rounded-full animate-spin-reverse"></div>
        </div>
        
        {/* Acolyte text below the spinner */}
        <div className="mt-4 text-[#5A3999] font-semibold text-lg">
          Training in progress ..
        </div>
      </div>
    </div>
  );
}





/* Add this to your globals.css or tailwind.config.js */
/*
@keyframes spin-reverse {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.animate-spin-reverse {
  animation: spin-reverse 1.5s linear infinite;
}
*/