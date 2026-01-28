import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
    }

  return (
    <div className='bg-[#0a0a0a] py-32 px-6 border-t border-[#B8860B]/10 relative overflow-hidden'>
      
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-serif text-white opacity-[0.02] pointer-events-none whitespace-nowrap">
        PHILABASKET
      </div>

      <div className='relative z-10 text-center'>
        {/* Ornament */}
        <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-[#B8860B]/30"></div>
            <span className="text-[10px] tracking-[0.4em] text-[#B8860B] uppercase font-light">Exclusive Invitations</span>
            <div className="h-[1px] w-8 bg-[#B8860B]/30"></div>
        </div>

        <h2 className='text-4xl md:text-6xl font-serif text-white mb-6'>
          Join the <span className='italic text-[#B8860B]'>Inner Circle</span>
        </h2>
        
        <p className='text-gray-500 max-w-lg mx-auto text-sm md:text-base font-light tracking-wide leading-relaxed'>
          Be the first to receive intelligence on rare acquisitions, private auctions, and the art of philatelic preservation.
        </p>

        <form onSubmit={onSubmitHandler} className='max-w-xl mx-auto mt-12 flex flex-col sm:flex-row items-center gap-0 group'>
          <div className='relative w-full'>
            <input 
              className='w-full bg-[#111111] border border-white/10 border-r-0 px-6 py-5 text-white outline-none focus:border-[#B8860B]/50 transition-all duration-500 placeholder:text-gray-600 font-light tracking-wider' 
              type="email" 
              placeholder='your.excellence@example.com' 
              required
            />
            {/* Animated Bottom Border */}
            <div className='absolute bottom-0 left-0 h-[1px] bg-[#B8860B] w-0 group-hover:w-full transition-all duration-700'></div>
          </div>
          
          <button 
            type='submit' 
            className='w-full sm:w-auto bg-[#B8860B] hover:bg-[#D4AF37] text-black text-[11px] font-bold tracking-[0.3em] px-12 py-5 transition-all duration-500 whitespace-nowrap'
          >
            REQUEST ACCESS
          </button>
        </form>

        <p className='mt-8 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-medium'>
          Privacy is our highest priority.
        </p>
      </div>
    </div>
  )
}

export default NewsletterBox