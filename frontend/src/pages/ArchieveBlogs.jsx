import React, { useEffect, useState, useContext, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { ArrowUpRight, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArchiveBlogs = () => {
    const { backendUrl } = useContext(ShopContext);
    const [blogs, setBlogs] = useState([]);
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(backendUrl + "/api/blog/list");
                if(response.data.success) {
                    // Show only the latest 5 blogs
                    setBlogs(response.data.blogs.slice(0, 5));
                }
            } catch (error) {
                console.error("Registry fetch failed", error);
            }
        };
        fetchBlogs();
    }, [backendUrl]);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (direction === 'left') {
            current.scrollBy({ left: -400, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <div className='pt-20 pb-24 bg-white min-h-screen relative overflow-hidden'>
            {/* Background Decorative Element */}
            <div className="absolute -left-[10vw] top-0 h-[60vh] w-[50vw] bg-gray-50 rounded-br-[500px] pointer-events-none"></div>

            {/* --- IMPROVED HEADING --- */}
            <div className='px-[6%] mb-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
                <div className='max-w-2xl'>
                    <div className='flex items-center gap-3 mb-6'>
                        <LayoutGrid size={14} className='text-[#BC002D]' />
                        <p className='text-[10px] font-black text-[#BC002D] tracking-[0.6em] uppercase'>The Philatelic Ledger</p>
                    </div>
                    <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.8] uppercase'>
                        Latest <br />
                        <span className='text-[#BC002D] outline-text'>Briefings.</span>
                    </h1>
                </div>
                <div className='flex gap-2 mb-2'>
                    <button onClick={() => scroll('left')} className='p-4 rounded-full border border-black/5 hover:bg-black hover:text-white transition-all'>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll('right')} className='p-4 rounded-full border border-black/5 hover:bg-black hover:text-white transition-all'>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* --- HORIZONTAL SCROLLABLE CAROUSEL --- */}
            <div 
                ref={scrollRef}
                className='flex overflow-x-auto gap-8 px-[6%] no-scrollbar snap-x snap-mandatory relative z-10'
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {blogs.map((blog, index) => (
                    <div 
                        key={index} 
                        onClick={() => navigate(`/blog/${blog._id}`)}
                        className='min-w-[85vw] md:min-w-[400px] lg:min-w-[450px] snap-start group cursor-pointer bg-white border border-black/5 hover:border-[#BC002D]/20 transition-all duration-500 flex flex-col'
                    >
                        {/* Rectangular Image */}
                        <div className='overflow-hidden relative bg-gray-50 aspect-[16/10]'>
                            <img 
                                src={blog.image} 
                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000' 
                                alt={blog.title} 
                            />
                            <div className='absolute bottom-0 right-0 bg-white text-black px-4 py-2 text-[8px] font-black uppercase tracking-widest'>
                                {blog.category || "Classified"}
                            </div>
                        </div>

                        <div className='p-8 flex flex-col flex-1'>
                            <div className='flex items-center justify-between mb-8'>
                                <p className='text-[9px] font-black text-gray-300 uppercase tracking-widest'>
                                    LOG ENTRY — {new Date(blog.date).toLocaleDateString('en-GB')}
                                </p>
                                <ArrowUpRight size={16} className='text-gray-200 group-hover:text-[#BC002D] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all' />
                            </div>

                            <h2 className='text-2xl font-bold text-gray-900 leading-tight mb-4 uppercase tracking-tighter'>
                                {blog.title}
                            </h2>
                            
                            <p className='text-gray-500 text-[11px] font-medium leading-relaxed mb-8 line-clamp-2 uppercase'>
                                {blog.content}
                            </p>

                            <div className='mt-auto pt-6 border-t border-black/[0.05]'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-[8px] font-black uppercase tracking-widest text-[#BC002D]'>Open Analysis</span>
                                    <span className='text-[10px] font-serif italic text-gray-300'>0{index + 1}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CSS for hiding scrollbars */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ArchiveBlogs;