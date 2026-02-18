import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedCategories = () => {
  const navigate = useNavigate();

  // --- ADMIN CONTROL PANEL ---
  const manualCategories = [
    { 
      id: 1, 
      name: 'Dance Stamps', 
      image: 'https://res.cloudinary.com/dvsdithxh/image/upload/v1770219653/stamp_registry/h2ifdbin9dcq9k84r7bo.jpg', 
      sub: 'Registry of Historical Events' 
    },
    { 
      id: 2, 
      name: 'Definitive', 
      image: 'https://res.cloudinary.com/dvsdithxh/image/upload/v1770219653/stamp_registry/trs6ctcknkumar6wkxqb.jpg', 
      sub: 'Standard Postal Specimens'
    },
    { 
      id: 3, 
      name: 'FDC', 
      image: 'https://res.cloudinary.com/dvsdithxh/image/upload/v1770219653/stamp_registry/trs6ctcknkumar6wkxqb.jpg', 
      sub: 'Canceled on Day of Issue' 
    },
    { 
      id: 4, 
      name: 'Miniature Sheet', 
      image: 'https://res.cloudinary.com/dvsdithxh/image/upload/v1770219653/stamp_registry/trs6ctcknkumar6wkxqb.jpg', 
      sub: 'Artistic Philatelic Blocks' 
    },
  ];

  return (
    <section className="bg-white py-10 md:py-24 px-4 max-w-[1440px] mx-auto border-b border-gray-100">
      {/* Header Aesthetic - Brighter & Stronger Typography */}
      <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BC002D] mb-4">
          Sovereign Collections
        </span>
        <h2 className="text-5xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-none">
                            FEATURED <span className="text-[#bd002d]">Categories.</span>
                        </h2>
        <div className="w-20 h-[5px] bg-black mt-6"></div>
      </div>

      {/* Grid: 2x2 on Mobile (grid-cols-2), 4 columns on Desktop (lg:grid-cols-4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
        {manualCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => {
                navigate(`/collection?category=${cat.name}`);
                window.scrollTo(0, 0);
            }}
            className="group relative cursor-pointer overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-[#BC002D]/40"
          >
            {/* Bright Image Container - Removed Grayscale */}
            <div className="aspect-[4/5] overflow-hidden bg-[#f9f9f9]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Brighter Overlay - Uses a lighter gradient for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 md:p-8">
              <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[7px] md:text-[9px] font-black text-[#BC002D] uppercase tracking-widest mb-1 md:mb-2 bg-white inline-block px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Specimen
                </p>
                <h3 className="text-sm md:text-2xl font-black text-white uppercase leading-tight tracking-tight drop-shadow-md">
                  {cat.name}
                </h3>
                <p className="hidden md:block text-[9px] text-gray-300 font-bold uppercase mt-1 tracking-widest">
                  {cat.sub}
                </p>
              </div>
              
              <div className="w-0 group-hover:w-full h-[3px] bg-[#BC002D] mt-4 transition-all duration-500 shadow-[0_0_10px_rgba(188,0,45,0.5)]"></div>
            </div>

            {/* Bright Index Tag */}
            <div className="absolute top-3 right-3 md:top-6 md:right-6 bg-white/90 border border-gray-200 px-2 py-1 backdrop-blur-sm shadow-sm">
               <span className="text-[7px] md:text-[9px] text-gray-900 font-black uppercase tracking-tighter">REF_{cat.id}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;