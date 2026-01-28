import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  const createSparkle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      color: i % 2 === 0 ? '#B8860B' : '#FFD700', 
      angle: (Math.random() * 360) * (Math.PI / 180),
      velocity: Math.random() * 100 + 50,
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);

    setTimeout(() => {
      navigate('/collection');
      window.scrollTo(0, 0);
    }, 350);
  };

  return (
    <div className='w-full min-h-screen bg-[#0a0a0a] overflow-hidden relative select-none flex flex-col justify-center py-10 px-6 md:px-16 lg:px-24'>
      
      {/* --- Ambient Background Layers --- */}
      {/* Central Gold Radial Glow - Enhanced with richer amber-gold and bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(218,165,32,0.18)_0%,_rgba(184,134,11,0.05)_40%,_transparent_75%)] pointer-events-none filter blur-2xl"></div>
      
      {/* Background Watermark Specimen */}
      <div className='absolute left-[-5%] top-[10%] opacity-[0.03] rotate-[-15deg] pointer-events-none'>
          <img src={assets.main02} className='w-[40vw] filter grayscale invert' alt="Background Specimen" />
      </div>

      {/* --- Text Content: Editorial Layout --- */}
      <div className='relative z-50 flex flex-col items-center text-center'>
        
        {/* Top Tagline Ornament */}
        <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <p className='text-[10px] md:text-xs tracking-[0.5em] text-[#D4AF37] uppercase font-light drop-shadow-md'>
                Philately Excellence • MMXXVI
            </p>
            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
        </div>

        {/* Cinematic Serif Title - Added Metallic Gold Gradient to 'Archives' */}
        <h1 className='font-serif text-5xl sm:text-7xl lg:text-9xl text-white leading-[1] mb-8 tracking-tighter'>
        The Philatelic  <br />
            <span className="italic font-light bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#8B6B23] bg-clip-text text-transparent ml-8 md:ml-16 leading-none tracking-normal drop-shadow-[0_2px_10px_rgba(184,134,11,0.3)]">Archives.</span>
        </h1>

        <div className="max-w-xl mx-auto space-y-8">
            <p className='text-sm md:text-base text-gray-400 font-light leading-relaxed tracking-wide italic'>
                Discover rare specimens and historical artifacts curated for the world's most distinguished philatelists.
            </p>
            
            {/* Interactive Action Buttons */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-6 pt-4'>
                <button 
                    onClick={createSparkle}
                    /* Button Enhanced: Metallic gradient background and intense gold glow shadow */
                    className='relative bg-gradient-to-r from-[#8B6B23] via-[#D4AF37] to-[#B8860B] text-black px-12 py-4 text-[10px] font-bold tracking-[0.4em] uppercase hover:brightness-110 transition-all duration-500 rounded-sm shadow-[0_0_35px_rgba(212,175,55,0.4)] overflow-visible group'
                >
                    <span className="relative z-10">Enter The Vault</span>
                    
                    {/* Sparkle Particle Layer */}
                    {particles.map((p) => (
                        <span 
                            key={p.id}
                            className="absolute pointer-events-none rounded-full animate-sparkle"
                            style={{
                                left: p.x,
                                top: p.y,
                                backgroundColor: p.color,
                                '--tw-translate-x': `${Math.cos(p.angle) * p.velocity}px`,
                                '--tw-translate-y': `${Math.sin(p.angle) * p.velocity}px`,
                                width: '4px',
                                height: '4px',
                                boxShadow: `0 0 10px ${p.color}` // Particles now glow
                            }}
                        />
                    ))}
                </button>
            </div>
        </div>
      </div>

      {/* --- Scattered Artifact Collage --- */}
      <div className='relative w-full h-[300px] md:h-[450px] mt-20 md:mt-10 flex items-center justify-center'>
        
        {/* Main Center Stamp with Gold Frame Shadow */}
        <div className='absolute z-30 transform hover:scale-105 transition-transform duration-1000 cursor-pointer w-[60%] sm:w-[40%] lg:w-[22%]'>
            <div className="relative p-2 bg-gradient-to-tr from-[#D4AF37]/50 to-white/10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.2)]">
                <img draggable="false" className='w-full h-auto drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]' src={assets.main01} alt="Primary Specimen" />
            </div>
        </div>

        {/* Floating Specimen Left */}
        <div className='absolute left-[5vw] top-[15%] w-[35%] sm:w-[25%] lg:w-[15%] z-20 opacity-40 hover:opacity-100 transition-opacity duration-700 animate-pulse'>
            <img draggable="false" className='w-full h-auto filter grayscale hover:grayscale-0 transition-all duration-500' src={assets.main02} alt="Artifact 2" />
        </div>

        {/* Floating Specimen Right */}
        <div className='absolute right-[5vw] top-[5%] w-[35%] sm:w-[25%] lg:w-[15%] z-20 opacity-40 hover:opacity-100 transition-opacity duration-700 animate-bounce-slow'>
            <img draggable="false" className='w-full h-auto filter grayscale hover:grayscale-0 transition-all duration-500' src={assets.main03} alt="Artifact 3" />
        </div>
      </div>

      {/* --- Scroll Indicator --- */}
      <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30'>
          <span className='text-[8px] tracking-[0.5em] text-[#D4AF37] uppercase font-bold'>Scroll to Explore</span>
          <div className='w-[1px] h-12 bg-gradient-to-b from-[#D4AF37] to-transparent'></div>
      </div>

      {/* Embedded CSS for Particle Animation and Custom Movements */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sparkle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-sparkle {
          animation: sparkle 0.8s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default Hero;