import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className='bg-white px-6 md:px-16 lg:px-24 select-none'>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'THE'} text2={'ARCHIVE'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16 items-center'>
          {/* Using your specific about image or logo mark */}
          <div className='w-full md:max-w-[450px] relative group'>
              <div className='absolute -inset-1 bg-gradient-to-r from-[#BC002D] to-black rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000'></div>
              <img draggable="false" className='relative w-full rounded-lg shadow-2xl' src={assets.about_img} alt="PhilaBasket Archive" />
          </div>

          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-500'>
              <p className='leading-relaxed'>
                <span className='text-black font-black'>PhilaBasket</span> was established in <span className='text-black'>MMXXVI</span> (2026) with a singular vision: to create a sovereign registry for the world’s most significant philatelic specimens. We have revolutionized the acquisition process by bridging the gap between traditional philately and digital preservation.
              </p>
              <p className='leading-relaxed'>
                Our journey began in <span className='text-black'>New Delhi</span>, driven by a passion for the historical narrative carried by every stamp. Today, we manage an expansive digital vault that allows curators and enthusiasts to explore, authenticate, and secure rare specimens from the comfort of their private galleries.
              </p>
              <div className='h-[1px] w-12 bg-[#BC002D]'></div>
              <b className='text-gray-900 uppercase tracking-[0.3em] text-xs'>Our Mission</b>
              <p className='leading-relaxed italic'>
                "To empower the global collector network with absolute transparency, verified provenance, and an unparalleled standard of archival excellence."
              </p>
          </div>
      </div>

      <div className='text-xl py-8'>
          <Title text1={'COLLECTOR'} text2={'ASSURANCE'} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 text-sm mb-20 gap-0 border border-gray-100'>
          <div className='px-10 md:px-16 py-16 flex flex-col gap-5 hover:bg-gray-50 transition-all duration-500'>
            <b className='uppercase tracking-widest text-[#BC002D]'>Registry Verification:</b>
            <p className='text-gray-500 leading-relaxed font-medium'>Every specimen in our gallery undergoes a multi-point vetting process to ensure it meets sovereign archival standards.</p>
          </div>
          <div className='px-10 md:px-16 py-16 flex flex-col gap-5 bg-[#BC002D] group'>
            <b className='uppercase tracking-widest text-white'>Secure Vaulting:</b>
            <p className='text-white/80 leading-relaxed font-medium'>From New Delhi to the world, our logistics network ensures that every acquisition is handled with the precision of a high-value asset.</p>
          </div>
          <div className='px-10 md:px-16 py-16 flex flex-col gap-5 hover:bg-gray-50 transition-all duration-500'>
            <b className='uppercase tracking-widest text-[#BC002D]'>Curator Support:</b>
            <p className='text-gray-500 leading-relaxed font-medium'>Our dedicated administrative team is available for registry reconciliation, bulk acquisitions, and private consultations.</p>
          </div>
      </div>

      {/* --- CONTACT & REGISTRY LOCATION SECTION --- */}
      <div className='mb-28 py-20 bg-gray-900 rounded-[40px] md:rounded-[80px] px-10 relative overflow-hidden'>
          <div className='absolute right-0 top-0 w-1/2 h-full bg-[#BC002D]/10 rounded-l-full blur-3xl'></div>
          
          <div className='relative z-10 flex flex-col items-center text-center'>
            <span className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black mb-6'>Direct Channels</span>
            <h3 className='text-3xl md:text-5xl font-bold text-white mb-12 tracking-tighter'>Liaise with the <span className='italic text-[#BC002D]'>Registry.</span></h3>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl'>
                <div className='flex flex-col gap-2'>
                    <p className='text-[10px] text-gray-500 uppercase font-black tracking-widest'>HQ Location</p>
                    <p className='text-white text-sm font-bold'>New Delhi, 110092 India</p>
                </div>
                <div className='flex flex-col gap-2'>
                    <p className='text-[10px] text-gray-500 uppercase font-black tracking-widest'>Sovereign Line</p>
                    <p className='text-white text-sm font-bold'>+91 9999167799</p>
                </div>
                <div className='flex flex-col gap-2'>
                    <p className='text-[10px] text-gray-500 uppercase font-black tracking-widest'>Admin Email</p>
                    <p className='text-white text-sm font-bold'>admin@philabasket.com</p>
                </div>
            </div>
          </div>
      </div>
      
    </div>
  )
}

export default About