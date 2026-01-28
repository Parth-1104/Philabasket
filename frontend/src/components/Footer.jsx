import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] pt-24 pb-12 px-6 md:px-16 lg:px-24 border-t border-[#B8860B]/10">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          
          {/* Brand Identity & Philosophy */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center">
              <img 
                draggable="false" 
                src={assets.logo} 
                className="w-40 brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-500 cursor-pointer" 
                alt="PhilaBasket" 
              />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed tracking-wide font-light max-w-xs">
              Empowering global collectors to discover and preserve the world's most distinguished philatelic specimens since MMXXVI.
            </p>
            {/* Gold-Tinted Socials */}
            <div className="flex gap-6">
              {[
                { icon: assets.twitter_icon, name: 'X' },
                { icon: assets.instagram_icon, name: 'Instagram' },
                { icon: assets.linkedin_icon, name: 'LinkedIn' }
              ].map((social, index) => (
                <img 
                  key={index}
                  src={social.icon} 
                  className="w-5 h-5 opacity-40 hover:opacity-100 hover:scale-110 transition-all cursor-pointer brightness-0 invert" 
                  alt={social.name} 
                />
              ))}
            </div>
          </div>

          {/* Navigation Suites */}
          {[
            {
              title: 'The Collection',
              links: ['Rare Stamps', 'New Arrivals', 'Auction House', 'Collector Kits']
            },
            {
              title: 'Resources',
              links: ['Philately Blog', 'Stamp Guide', 'Support', 'Verification']
            },
            {
              title: 'The Company',
              links: ['Our Story', 'Careers', 'Contact', 'Partners']
            }
          ].map((column, idx) => (
            <div key={idx} className="lg:ml-auto">
              <h4 className="text-[#B8860B] font-serif text-xs uppercase tracking-[0.4em] mb-8 font-medium">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-5 text-gray-500 text-[13px] font-light tracking-wider">
                {column.links.map((link, lIdx) => (
                  <li 
                    key={lIdx} 
                    className="hover:text-white hover:translate-x-1 transition-all duration-300 cursor-pointer w-fit"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator - Gold Fade */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#B8860B]/20 to-transparent my-20"></div>

        {/* Legal & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[#B8860B] text-[10px] tracking-[0.3em] font-medium uppercase">
              PhilaBasket Global Archive
            </p>
            <p className="text-gray-600 text-[10px] tracking-widest font-light">
              © 2026 ALL RIGHTS RESERVED.
            </p>
          </div>
          
          <div className="flex gap-10">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((legal, index) => (
              <span 
                key={index}
                className="text-[10px] font-bold text-gray-500 hover:text-[#B8860B] cursor-pointer tracking-[0.2em] uppercase transition-colors"
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

export default Footer