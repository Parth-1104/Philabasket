import React from 'react'
import { assets } from '../assets/assets'

const NewHero = ({scrollHandler}) => {
  return (
    <div className='w-full min-h-screen  lg:h-[100vh] border-b-8 border-[#E8773D] bg-gradient-to-br from-[#F4A261] via-[#E9C46A] to-[#2A9D8F] py-10 lg:py-20 overflow-hidden relative select-none flex flex-col items-center justify-center'>
      
      {/* Animated Dotted Pattern Background */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute inset-0' style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Decorative World Map Background */}
      <div className='absolute inset-0 opacity-15'>
        <svg className='w-full h-full' viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 300 Q 400 250, 600 300 T 1000 300" stroke="currentColor" strokeWidth="3" className='text-white' opacity="0.4"/>
          <path d="M150 350 Q 350 320, 550 350 T 950 350" stroke="currentColor" strokeWidth="2" className='text-white' opacity="0.3"/>
          <circle cx="300" cy="280" r="5" fill="currentColor" className='text-white animate-pulse'/>
          <circle cx="600" cy="300" r="5" fill="currentColor" className='text-white animate-pulse' style={{animationDelay: '0.5s'}}/>
          <circle cx="900" cy="280" r="5" fill="currentColor" className='text-white animate-pulse' style={{animationDelay: '1s'}}/>
          <circle cx="450" cy="320" r="4" fill="currentColor" className='text-[#E76F51] animate-pulse' style={{animationDelay: '1.5s'}}/>
          <circle cx="750" cy="310" r="4" fill="currentColor" className='text-[#E76F51] animate-pulse' style={{animationDelay: '2s'}}/>
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[10%] left-[5%] w-20 h-20 border-4 border-white/30 rotate-45 animate-float-slow'></div>
        <div className='absolute top-[60%] right-[8%] w-16 h-16 bg-[#E76F51]/20 rounded-full animate-float-slow' style={{animationDelay: '1s'}}></div>
        <div className='absolute bottom-[15%] left-[15%] w-12 h-12 border-4 border-[#2A9D8F]/30 animate-float-slow' style={{animationDelay: '2s'}}></div>
        <div className='absolute top-[25%] right-[20%] w-8 h-8 bg-white/20 rotate-12 animate-float-slow' style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Decorative Corner Stamp - Top Left with Enhanced Border */}
      <div className='absolute left-0 top-0 w-32 h-32 lg:w-48 lg:h-48 opacity-30 rotate-12 hidden lg:block'>
        <div className='w-full h-full border-8 border-dashed border-white/60 relative'>
          <div className='absolute inset-2 border-4 border-white/40'></div>
        </div>
      </div>

      {/* Decorative Corner Stamp - Bottom Right with Enhanced Border */}
      <div className='absolute right-0 bottom-0 w-40 h-40 lg:w-64 lg:h-64 opacity-20 -rotate-12 hidden lg:block'>
        <div className='w-full h-full border-8 border-dashed border-[#264653]/40 relative'>
          <div className='absolute inset-2 border-4 border-[#264653]/30'></div>
        </div>
      </div>

      {/* Postal Marks Decoration */}
      <div className='absolute top-[15%] right-[10%] hidden lg:block opacity-40 animate-float'>
        <div className='relative'>
          <div className='w-24 h-24 rounded-full border-4 border-[#E76F51] flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-xs font-black text-[#264653]'>DEC 47 PM</div>
              <div className='text-[8px] font-bold text-[#264653] mt-1'>INDIA</div>
            </div>
          </div>
          <div className='absolute -bottom-2 -right-2 w-6 h-6 bg-[#E76F51] rounded-full'></div>
        </div>
      </div>

      {/* Additional Postal Mark - Left Side */}
      <div className='absolute bottom-[25%] left-[5%] hidden lg:block opacity-35 animate-float-slow' style={{animationDelay: '1s'}}>
        <div className='w-20 h-20 rounded-full border-4 border-[#2A9D8F] flex items-center justify-center rotate-12'>
          <div className='text-center'>
            <div className='text-[10px] font-black text-white'>AIRMAIL</div>
          </div>
        </div>
      </div>

      {/* Top Text Content with Energetic Typography */}
      <div className='text-center mb-8 sm:mb-10 lg:mb-16 relative z-50 px-4 sm:px-6'>
        <div className='flex flex-col items-center justify-center gap-2 sm:gap-3'>

            {/* Multiple Animated Badges */}
            <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4'>
                <div className='inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full shadow-lg border-2 border-[#E76F51] animate-bounce'>
                    <div className='w-2 h-2 bg-[#E76F51] rounded-full animate-pulse'></div>
                    <span className='text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#264653]'>
                        MMXXVI Collection
                    </span>
                </div>
                
                <div className='inline-flex items-center gap-2 bg-[#2A9D8F] px-4 sm:px-5 py-2 rounded-full shadow-lg border-2 border-white animate-pulse'>
                    <span className='text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-white'>
                        ★ Limited Edition
                    </span>
                </div>
            </div>

            {/* Sticker-Style "HOT" Badge */}
            <div className='absolute -top-4 right-[10%] sm:right-[15%] lg:right-[25%] z-50 animate-wiggle'>
                <div className='relative'>
                    <div className='w-16 h-16 sm:w-20 sm:h-20 bg-[#E76F51] rounded-full flex items-center justify-center shadow-2xl border-4 border-white transform -rotate-12'>
                        <span className='text-white font-black text-sm sm:text-base'>HOT</span>
                    </div>
                    <div className='absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-ping'></div>
                </div>
            </div>

            {/* Sticker-Style "NEW" Badge */}
            <div className='absolute -top-2 left-[10%] sm:left-[15%] lg:left-[20%] z-50 animate-wiggle' style={{animationDelay: '0.3s'}}>
                <div className='bg-gradient-to-br from-yellow-400 to-orange-500 px-4 py-2 rounded-lg shadow-2xl border-3 border-white transform rotate-6'>
                    <span className='text-white font-black text-xs sm:text-sm uppercase'>✨ NEW</span>
                </div>
            </div>

            {/* Main Title with Bold, Playful Typography and Texture */}
            <h1 className='font-black mt-20 text-4xl sm:text-6xl md:text-7xl lg:text-9xl text-white tracking-tight leading-[0.9] drop-shadow-2xl relative'>
                <span className='inline-block hover:scale-110 transition-transform duration-300'>P</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.1s'}}>H</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.2s'}}>I</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.3s'}}>L</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.4s'}}>A</span>
                {' '}
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.5s'}}>B</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.6s'}}>A</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.7s'}}>S</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.8s'}}>K</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '0.9s'}}>E</span>
                <span className='inline-block hover:scale-110 transition-transform duration-300' style={{animationDelay: '1s'}}>T</span>
            </h1>
            
            {/* Subtitle with Contrasting Color and Stroke Effect */}
            <h2 className='font-black text-3xl sm:text-5xl md:text-6xl lg:text-8xl text-[#2A9D8F] tracking-tight leading-[0.9] drop-shadow-lg mt-1 sm:mt-2 relative'
                style={{
                    WebkitTextStroke: '2px white',
                    paintOrder: 'stroke fill'
                }}>
                STAMPS
            </h2>

            {/* Decorative Underline with Icons */}
            <div className='flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4'>
                <div className='w-12 sm:w-20 h-1 bg-white rounded-full animate-pulse'></div>
                <div className='flex gap-1'>
                    <div className='w-2 h-2 bg-[#E76F51] rounded-full animate-bounce'></div>
                    <div className='w-2 h-2 bg-[#2A9D8F] rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                    <div className='w-2 h-2 bg-yellow-400 rounded-full animate-bounce' style={{animationDelay: '0.4s'}}></div>
                </div>
                <div className='w-12 sm:w-20 h-1 bg-white rounded-full animate-pulse'></div>
            </div>

            {/* Call to Action Text with Glow Effect */}
            <div className='relative mt-4 sm:mt-6'>
                <p className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-white drop-shadow-md tracking-wide relative z-10 animate-pulse'>
                    BUY NOW
                </p>
                <div className='absolute inset-0 bg-[#E76F51] blur-xl opacity-50 animate-pulse'></div>
            </div>
            
            {/* Enhanced Tags Row */}
            <div className='flex flex-wrap items-center justify-center gap-2 mt-2 sm:mt-3'>
                <span className='text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/90 uppercase bg-[#264653]/60 px-3 py-1 rounded-full border border-white/30'>
                    🎯 Explore
                </span>
                <span className='text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/90 uppercase bg-[#E76F51]/60 px-3 py-1 rounded-full border border-white/30'>
                    💎 Collect
                </span>
                <span className='text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white/90 uppercase bg-[#2A9D8F]/60 px-3 py-1 rounded-full border border-white/30'>
                    ⭐ Treasure
                </span>
            </div>
        </div>
      </div>

      {/* Dynamic Stamp Collage with Rotation and Overlap */}
      <div className='relative w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] max-w-7xl px-4'>
        
        {/* Sparkle Effects Around Main Stamp */}
        <div className='absolute left-1/2 top-[5%] -translate-x-1/2 w-[70%] sm:w-[60%] lg:w-[40%] h-[300px] pointer-events-none z-10'>
            <div className='absolute -top-4 -left-4 w-3 h-3 bg-yellow-300 rounded-full animate-ping'></div>
            <div className='absolute -top-2 right-[20%] w-2 h-2 bg-white rounded-full animate-pulse'></div>
            <div className='absolute top-[10%] -right-6 w-4 h-4 bg-yellow-400 rounded-full animate-ping' style={{animationDelay: '0.5s'}}></div>
            <div className='absolute bottom-[20%] -left-6 w-2 h-2 bg-white rounded-full animate-pulse' style={{animationDelay: '1s'}}></div>
            <div className='absolute -bottom-4 right-[30%] w-3 h-3 bg-yellow-300 rounded-full animate-ping' style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Main Featured Stamp - Center with Red Border and Perforated Edge Effect */}
        <div className='absolute left-1/2 -translate-x-1/2 top-[8%] sm:top-[10%] lg:top-[5%] w-[70%] sm:w-[60%] md:w-[50%] lg:w-[40%] z-30 shadow-2xl border-[8px] sm:border-[12px] lg:border-[16px] border-white bg-white hover:scale-110 hover:rotate-2 transition-all duration-500 animate-float relative'>
            {/* Perforated edge effect */}
            <div className='absolute -top-3 left-0 right-0 flex justify-around'>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className='w-2 h-2 bg-[#F4A261] rounded-full'></div>
                ))}
            </div>
            <div className='absolute -bottom-3 left-0 right-0 flex justify-around'>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className='w-2 h-2 bg-[#F4A261] rounded-full'></div>
                ))}
            </div>
            <div className='absolute -left-3 top-0 bottom-0 flex flex-col justify-around'>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className='w-2 h-2 bg-[#F4A261] rounded-full'></div>
                ))}
            </div>
            <div className='absolute -right-3 top-0 bottom-0 flex flex-col justify-around'>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className='w-2 h-2 bg-[#F4A261] rounded-full'></div>
                ))}
            </div>
            
            {/* Postal Stamp Circle */}
            <div className='absolute -top-6 -right-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full border-4 border-[#E76F51] flex items-center justify-center shadow-xl z-10 animate-spin-slow'>
                <div className='w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#E76F51] to-[#E9C46A] rounded-full flex items-center justify-center'>
                    <span className='text-white font-black text-xs sm:text-sm lg:text-base'>NY</span>
                </div>
            </div>

            {/* Price Tag Sticker */}
            <div className='absolute -bottom-4 -left-4 bg-[#E76F51] text-white px-3 py-2 rounded-lg shadow-xl transform -rotate-12 border-2 border-white z-10'>
                <div className='text-[10px] font-black'>₹ 499</div>
            </div>

            <img draggable="false" className='w-full h-auto' src={assets.main01} alt="Main Stamp" />
        </div>

        {/* Floating Stamp Left Top - With Teal Accent and Enhanced Details */}
        <div className='absolute left-[2%] sm:left-[5%] top-[0%] sm:top-[5%] w-[32%] sm:w-[34%] md:w-[30%] lg:w-[20%] z-20 shadow-xl border-4 sm:border-6 border-[#2A9D8F] hover:scale-105 hover:-rotate-6 transition-all duration-700 -rotate-3 bg-white relative group'>
            {/* Stamp perforation effect */}
            <div className='absolute -top-2 left-0 right-0 flex justify-around opacity-70'>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className='w-1.5 h-1.5 bg-[#2A9D8F] rounded-full'></div>
                ))}
            </div>
            
            {/* "RARE" Label */}
            <div className='absolute -top-3 -right-3 bg-yellow-400 text-[#264653] text-[8px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white z-10 group-hover:scale-110 transition-transform'>
                RARE
            </div>
            
            <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Stamp 2" />
        </div>

        {/* Floating Stamp Right - With Orange Border and Ribbon */}
        <div className='absolute right-[2%] sm:right-[5%] lg:right-[25%] top-[15%] sm:top-[18%] lg:top-[20%] w-[34%] sm:w-[36%] md:w-[32%] lg:w-[20%] z-25 shadow-2xl border-4 sm:border-6 border-[#E76F51] rotate-6 hover:rotate-12 hover:scale-105 transition-all duration-500 bg-white relative group'>
            {/* Corner Ribbon */}
            <div className='absolute -top-2 -left-2 w-12 h-12 bg-[#E76F51] overflow-hidden z-10'>
                <div className='absolute top-3 left-[-20px] right-[-20px] text-center text-white text-[8px] font-black transform -rotate-45'>
                    50% OFF
                </div>
            </div>
            
            {/* Stamp perforation */}
            <div className='absolute -bottom-2 left-0 right-0 flex justify-around opacity-70'>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className='w-1.5 h-1.5 bg-[#E76F51] rounded-full'></div>
                ))}
            </div>
            
            <img draggable="false" className='w-full h-auto' src={assets.main03} alt="Stamp 3" />
        </div>

        {/* Floating Stamp Bottom Left - Enhanced with Effects */}
        <div className='absolute left-[8%] sm:left-[12%] lg:left-[4%] bottom-[0%] sm:bottom-[-5%] lg:bottom-[5%] w-[30%] sm:w-[28%] lg:w-[22%] z-40 shadow-2xl border-4 sm:border-6 border-[#E9C46A] hidden sm:block hover:scale-110 rotate-3 hover:-rotate-3 transition-all duration-500 bg-white relative group'>
            {/* Star Rating Badge */}
            <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-white border-2 border-[#E9C46A] rounded-full px-2 py-1 shadow-lg z-10'>
                <div className='text-[10px]'>⭐⭐⭐⭐⭐</div>
            </div>
            
            {/* Perforated edges */}
            <div className='absolute -left-2 top-0 bottom-0 flex flex-col justify-around opacity-70'>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className='w-1.5 h-1.5 bg-[#E9C46A] rounded-full'></div>
                ))}
            </div>
            
            <img draggable="false" className='w-full h-auto' src={assets.main04} alt="Stamp 4" />
        </div>

        {/* Additional Decorative Stamp - Desktop only with Animation */}
        <div className='absolute right-[8%] bottom-[8%] w-[18%] z-10 opacity-60 grayscale rotate-[-15deg] hidden lg:block hover:grayscale-0 hover:opacity-100 transition-all duration-700 border-4 border-white shadow-xl bg-white animate-float-slow'>
            <img draggable="false" className='w-full h-auto' src={assets.main02} alt="Background Stamp" />
        </div>

        {/* Compass Decoration - Enhanced with More Details */}
        <div className='absolute left-1/2 -translate-x-1/2 bottom-[-8%] sm:bottom-[-12%] lg:bottom-[-5%] w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 z-50'>
            <div className='relative w-full h-full bg-white rounded-full shadow-2xl border-4 border-[#E76F51] flex items-center justify-center animate-spin-slow'>
                {/* Compass markings */}
                <div className='absolute w-full h-full'>
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={i}
                            className='absolute top-0 left-1/2 h-1/2 w-0.5 bg-gray-300 origin-bottom'
                            style={{transform: `rotate(${i * 45}deg)`}}
                        ></div>
                    ))}
                </div>
                
                {/* Main compass points */}
                <div className='absolute w-full h-full'>
                    <div className='absolute top-0 left-1/2 -translate-x-1/2 w-1 h-4 sm:h-5 bg-[#E76F51]'></div>
                    <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 sm:h-5 bg-[#2A9D8F]'></div>
                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-1 bg-[#E76F51]'></div>
                    <div className='absolute right-0 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-1 bg-[#2A9D8F]'></div>
                </div>
                
                {/* Direction labels */}
                <div className='text-xs sm:text-sm font-black text-[#264653] z-10'>
                    <div className='absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 text-[#E76F51]'>N</div>
                    <div className='absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 text-[#2A9D8F]'>S</div>
                    <div className='absolute -left-8 sm:-left-10 top-1/2 -translate-y-1/2 text-[#E76F51]'>W</div>
                    <div className='absolute -right-8 sm:-right-10 top-1/2 -translate-y-1/2 text-[#2A9D8F]'>E</div>
                </div>
                
                {/* Center needle */}
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#E76F51] to-[#2A9D8F] rounded-full shadow-inner relative'>
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-0.5 h-4 bg-[#E76F51]'></div>
                </div>
            </div>
        </div>
      </div>

      {/* Side Info Panel - Desktop only */}
      <div className='absolute bottom-[15%] right-8 lg:right-12 hidden lg:flex flex-col items-end gap-4 z-50'>
          <div className='bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-4 border-[#2A9D8F] max-w-xs'>
              <p className='text-sm font-black uppercase tracking-[0.15em] text-[#264653] mb-2'>
                  SPECIAL OFFERS
              </p>
              <p className='text-xs text-gray-600 font-bold'>
                  Exclusive <span className='text-[#E76F51]'>bonuses</span> for new collectors
              </p>
          </div>
          <div 
            onClick={scrollHandler}
            className='bg-[#E76F51] text-white rounded-full p-6 cursor-pointer hover:bg-[#264653] transition-all duration-500 shadow-2xl hover:shadow-[#E76F51]/50 hover:scale-125 border-4 border-white'
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
              </svg>
          </div>
      </div>

      {/* Mobile CTA - Enhanced with color */}
      <div onClick={scrollHandler} className='lg:hidden mt-8 sm:mt-10 flex flex-col items-center gap-3 cursor-pointer z-50'>
         <p className='text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white/90 bg-[#264653]/60 px-4 py-2 rounded-full'>
            Explore Collection
         </p>
         <div className='w-2 h-16 sm:h-20 bg-gradient-to-b from-white via-[#E76F51] to-transparent rounded-full animate-bounce'></div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>

    </div>
  )
}

export default NewHero