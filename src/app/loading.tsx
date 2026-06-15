"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      <style>{`
        @keyframes spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-counter-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes pulse-scale-opacity {
          0%, 100% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .animate-spin-clockwise {
          animation: spin-clockwise 2s linear infinite;
        }
        .animate-spin-counter-clockwise {
          animation: spin-counter-clockwise 3s linear infinite;
        }
        .animate-spin-logo {
          animation: spin-clockwise 4s linear infinite;
        }
        .animate-pulse-logo {
          animation: pulse-scale-opacity 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div
          className="absolute w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary border-r-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-spin-clockwise"
        />
        
        {/* Inner reverse spinning ring */}
        <div
          className="absolute w-16 h-16 rounded-full border-4 border-purple-500/20 border-b-purple-500 border-l-purple-500 animate-spin-counter-clockwise"
        />

        {/* Center pulsing & rotating Nova image */}
        <div className="animate-pulse-logo flex items-center justify-center">
          <div className="animate-spin-logo flex items-center justify-center">
            <img 
              src="/assets/nova.png" 
              alt="Nova Loading Logo" 
              className="w-7 h-7 object-contain rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 uppercase animate-pulse">
        Loading Environment...
      </p>
    </div>
  );
}

