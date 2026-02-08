import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="relative bg-white pt-32 pb-16 px-6 md:px-16 lg:px-24 overflow-hidden border-t border-black/[0.03] select-none">
      
      {/* --- NEWHERO CURVED ACCENT (Bottom Right) --- */}
      <div className="absolute -right-[15vw] -bottom-[10vh] h-[60vh] w-[50vw] bg-[#BC002D] rounded-tl-[600px] pointer-events-none opacity-100 transition-all duration-700"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          
          {/* Brand Identity */}
          <div className="flex flex-col gap-10">
            <div className='flex items-center gap-2 md:gap-3 mr-7 group cursor-pointer'>
                {/* BRAND LOGO - The Mark */}
                <img 
                  src={assets.logo} 
                  className='w-8 md:w-10 lg:w-12 group-hover:rotate-[360deg] transition-transform duration-1000 object-contain' 
                  alt="PhilaBasket Logo" 
                />
                
                {/* BRAND TEXT - Logo-5.png */}
                <img 
                  src='Logo-5.png' 
                  className='w-24 md:w-28 lg:w-32 h-auto object-contain' 
                  alt="PhilaBasket Text" 
                />
            </div>
            
            <p className="text-gray-400 text-[10px] leading-relaxed tracking-[0.2em] font-black uppercase max-w-xs">
              Sovereign Registry for international philatelic specimens. Empowering global collectors since <span className='text-black'>MMXXVI.</span>
            </p>

            {/* Social Channels */}
            <div className="flex gap-8">
              {['Twitter', 'Instagram', 'LinkedIn'].map((name) => (
                <span key={name} className="text-[9px] font-black tracking-widest text-gray-900 hover:text-[#BC002D] cursor-pointer transition-all uppercase">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {[
            {
              title: 'Registry Index',
              links: [
                {label: 'Gallery', path: '/collection'}, 
                {label: 'New Arrivals', path: '/collection'}, 
                {label: 'Rare Archive', path: '/collection'}, 
                {label: 'Bestsellers', path: '/collection'}
              ]
            },
            {
              title: 'Curator Support',
              links: [
                {label: 'Authentication', path: '/about'}, 
                {label: 'Shipping Policy', path: '/about'}, 
                {label: 'Vault Access', path: '/contact'}, 
                {label: 'FAQs', path: '/contact'}
              ]
            },
            {
              title: 'The Archive',
              links: [
                {label: 'Our Heritage', path: '/about'}, 
                {label: 'Collector Network', path: '/about'}, 
                {label: 'Contact', path: '/contact'}, 
                {label: 'Legal', path: '/about'}
              ]
            }
          ].map((column, idx) => (
            <div key={idx} className="lg:ml-auto">
              <h4 className="text-[#BC002D] text-[10px] uppercase tracking-[0.5em] mb-10 font-black">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-5">
                {column.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      to={link.path}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-gray-900 hover:text-black text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 block w-fit hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dynamic Separator */}
        <div className="w-full h-[1px] bg-black/[0.05] mt-32 mb-12"></div>

        {/* Bottom Bar: Legal & Identity */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className='flex items-center gap-3'>
               <div className='w-2 h-2 bg-[#BC002D] rounded-full animate-pulse'></div>
               <p className="text-gray-900 text-[10px] tracking-[0.4em] font-black uppercase">
                 Verified Global Archive
               </p>
            </div>
            <p className="text-gray-300 text-[9px] tracking-[0.4em] font-black uppercase">
              © 2026 PHILABASKET SOVEREIGN. ALL RIGHTS RESERVED.
            </p>
          </div>
          
          <div className="flex gap-10">
            {['Privacy', 'Terms', 'Security'].map((legal) => (
              <span 
                key={legal}
                className="text-[9px] font-black text-black md:text-gray-900 hover:text-white transition-colors cursor-pointer tracking-[0.4em] uppercase"
              >
                {legal}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;