import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { ChevronLeft, Calendar, User, Package, ArrowRight } from 'lucide-react';

const BlogContent = () => {
    const { blogId } = useParams();
    const { backendUrl, products } = useContext(ShopContext);
    const [blog, setBlog] = useState(null);
    const navigate = useNavigate();
    const createSeoSlug = (text) => {
        if (!text) return "";
        return text
            .toLowerCase()
            .replace(/ /g, '-')           // Replace spaces with -
            .replace(/[^\w-]+/g, '')      // Remove all non-word chars
            .replace(/--+/g, '-')         // Replace multiple - with single -
            .trim();
    };

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const response = await axios.get(backendUrl + "/api/blog/list");
                if (response.data.success) {
                    const found = response.data.blogs.find(b => b._id === blogId);
                    setBlog(found);
                }
            } catch (error) {
                console.error("Detail fetch failed", error);
            }
        };
        fetchBlogDetails();
        window.scrollTo(0, 0);
    }, [blogId, backendUrl]);

    const relatedProducts = useMemo(() => {
        if (!blog || !products) return [];
        return products.filter(item => item.blogLink === blogId || item.blogLink?.includes(blogId));
    }, [blog, products, blogId]);


    const getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (!blog) return <div className='min-h-screen bg-white'></div>;


    return (
        <div className='bg-white min-h-screen pt-32 pb-24 px-6 select-none'>
            {/* Main Article Container - Constrained for readability */}
            <div className='max-w-3xl mx-auto'>
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/blogs')}
                    className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#BC002D] transition-colors mb-12'
                >
                    <ChevronLeft size={14} /> Return to Archive
                </button>

                {/* Header Section */}
                <div className='mb-12'>
                    <p className='text-[#BC002D] text-[10px] font-black uppercase tracking-[0.5em] mb-4'>
                        {blog.category} // INTEL REPORT
                    </p>
                    <h1 className='text-3xl md:text-5xl font-bold text-gray-900 tracking-tighter leading-tight mb-8 uppercase'>
                        {blog.title}
                    </h1>

                    <div className='flex items-center gap-6 py-6 border-y border-black/5'>
                        <div className='flex items-center gap-2'>
                            <Calendar size={12} className='text-[#BC002D]' />
                            <span className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                {new Date(blog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <div className='w-1 h-1 bg-gray-200 rounded-full'></div>
                        <div className='flex items-center gap-2'>
                            <User size={12} className='text-[#BC002D]' />
                            <span className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                CURATOR: {blog.author || "Registry Staff"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Optimized Image Display */}
                <div className='mb-12 flex flex-col items-center'>
    {/* Container: Reduced to max-w-sm (approx 384px) on desktop 
        Image: max-h lowered to 300px for a more "specimen card" feel 
    */}
    {blog.image && (
    <div className='mb-12 flex flex-col items-center'>
        <div className='bg-gray-50 w-full lg:max-w-sm rounded-sm border border-black/5'>
            <img src={blog.image} className='w-full h-auto max-h-[300px] object-contain mx-auto' />
        </div>
    </div>
)}
    
    {/* Caption: Matches the width of the image container above */}
    <p className='text-[9px] text-gray-400 mt-3 italic uppercase tracking-wider text-center lg:max-w-sm'>
        Archive Figure 1.0: Visual analysis of current specimen
    </p>
</div>

{/* --- YOUTUBE VIDEO SECTION --- */}
{blog.youtubeUrl && getYouTubeID(blog.youtubeUrl) && (
    <div className='mb-12 max-w-3xl mx-auto'>
        <div className='flex items-center gap-3 mb-4'>
            <div className='w-2 h-2 bg-[#BC002D] animate-pulse rounded-full'></div>
            <p className='text-[10px] font-black uppercase tracking-widest text-gray-900'>
                Multimedia Analysis // <span className='text-[#BC002D]'>Video Report</span>
            </p>
        </div>
        
        <div className='relative w-full aspect-video rounded-sm overflow-hidden bg-black shadow-2xl border border-black/5'>
            <iframe
                className='absolute top-0 left-0 w-full h-full'
                src={`https://www.youtube.com/embed/${getYouTubeID(blog.youtubeUrl)}?rel=0&showinfo=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
        <p className='text-[9px] text-gray-400 mt-3 italic uppercase tracking-wider text-center'>
            Archive Media 1.1: Cinematic specimen review
        </p>
    </div>
)}

                {/* Narrative Content - Optimized Typography */}
                <div className='prose prose-sm md:prose-base max-w-none mb-24'>
                    <p className='text-gray-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium opacity-90'>
                        {blog.content}
                    </p>
                </div>
            </div>

            {/* Related Specimens - Slightly wider container allowed here for grid layout */}
            <div className='max-w-4xl mx-auto'>
                {relatedProducts.length > 0 && (
                    <div className='mt-20 pt-16 border-t border-black/10'>
                        <div className='flex items-center justify-between mb-10'>
                            <h3 className='text-xl font-black text-black uppercase tracking-tighter gap-2'>
                                Related  <span className='text-[#BC002D] '>Products</span> 
                            </h3>
                            <Package size={18} className='text-gray-300' />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {relatedProducts.map((item, index) => (
                                <div 
                                    key={index}
                                    onClick={() => {
                                        const slug = item.slug || createSeoSlug(item.name);
                                        navigate(`/product/${item._id}/${slug}`);
                                    }}
                                    className='group flex items-center gap-4 p-3 bg-gray-50 border border-transparent hover:border-black hover:bg-white transition-all cursor-pointer rounded-sm'
                                >
                                    <div className='w-20 h-20 bg-white p-2 border border-gray-100 flex-shrink-0'>
                                        <img src={item.image[0]} className='w-full h-full object-contain' alt="" />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h4 className='text-[11px] font-black text-gray-900 uppercase truncate mb-1'>{item.name}</h4>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-[11px] font-bold text-[#BC002D]'>₹{item.price}</span>
                                            <ArrowRight size={12} className='text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all' />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Quote */}
                <div className='mt-24 pt-12 border-t border-[#BC002D]/20 flex flex-col items-center'>
                    <div className='w-1 h-1 bg-[#BC002D] rounded-full mb-4'></div>
                    <p className='text-[9px] text-gray-300 font-black uppercase tracking-[0.6em] text-center'>
                        Official Philabasket Intelligence Record
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BlogContent;