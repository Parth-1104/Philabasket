import React, { useState } from 'react';
import { BookOpen, Award, ShieldCheck, Search, Lightbulb, Ruler, Zap, ChevronRight, HelpCircle } from 'lucide-react';
import Title from '../components/Title';

const KnowledgeCenter = () => {
    const [activeQuiz, setActiveQuiz] = useState(false);
    const [score, setScore] = useState(0);

    // Categories for the Knowledge Grid
    const categories = [
        { title: "Stamp Anatomy", desc: "Identify perforations, watermarks, and gumming.", icon: <Ruler size={20}/>, tag: "Technical" },
        { title: "Grading Standards", desc: "Understanding MNH, MLH, and Used conditions.", icon: <ShieldCheck size={20}/>, tag: "Valuation" },
        { title: "Preservation", desc: "How to store your archive for the next century.", icon: <Zap size={20}/>, tag: "Care" },
        { title: "Error Gallery", desc: "Spotting inverted centers and color shifts.", icon: <Search size={20}/>, tag: "Rarity" }
    ];

    return (
        <div className='bg-[#FCF9F4] min-h-screen pt-10 pb-20 px-6 md:px-16 lg:px-24 font-serif'>
            
            {/* --- HEADER --- */}
            <div className='max-w-6xl mx-auto mb-16'>
                <div className='flex items-center gap-4 mb-4'>
                    <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                    <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Educational Archive</p>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase mb-6'>
                    Knowledge <span className='text-[#BC002D]'>Center.</span>
                </h2>
                <div className='relative max-w-xl'>
                    <input 
                        type="text" 
                        placeholder="Search the Philatelic Database..." 
                        className='w-full bg-white border border-gray-100 py-4 px-6 rounded-full shadow-sm text-sm focus:outline-none focus:border-[#BC002D]/30 transition-all font-sans'
                    />
                    <Search className='absolute right-5 top-1/2 -translate-y-1/2 text-gray-300' size={18} />
                </div>
            </div>

            <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12'>
                
                {/* LEFT: KNOWLEDGE GRID */}
                <div className='lg:col-span-8 space-y-12'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {categories.map((cat, index) => (
                            <div key={index} className='bg-white p-8 border border-gray-100 rounded-3xl hover:shadow-xl transition-all group cursor-pointer'>
                                <div className='flex justify-between items-start mb-6'>
                                    <div className='p-3 bg-[#BC002D]/5 text-[#BC002D] rounded-xl group-hover:bg-[#BC002D] group-hover:text-white transition-colors'>
                                        {cat.icon}
                                    </div>
                                    <span className='text-[8px] font-black uppercase tracking-widest text-gray-300'>{cat.tag}</span>
                                </div>
                                <h4 className='text-xl font-bold mb-2 uppercase tracking-tight'>{cat.title}</h4>
                                <p className='text-sm text-gray-400 font-sans leading-relaxed'>{cat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* INTERACTIVE ANATOMY SECTION */}
                    <section className='bg-black rounded-[40px] p-10 text-white relative overflow-hidden'>
                        <div className='relative z-10'>
                            <h3 className='text-2xl font-bold uppercase tracking-tighter mb-4'>Stamp Anatomy 101</h3>
                            <p className='text-gray-400 text-sm max-w-md font-sans mb-8'>Hover over the physical characteristics to understand how expert registrars evaluate a specimen.</p>
                            
                            {/* Placeholder for actual image/svg map */}
                            <div className='aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative'>
                                <div className='absolute top-1/4 left-1/4 w-4 h-4 bg-[#BC002D] rounded-full animate-ping'></div>
                                <span className='text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Interactive Specimen Map</span>
                            </div>
                        </div>
                        <div className='absolute -right-20 -bottom-20 w-64 h-64 bg-[#BC002D]/20 blur-[100px]'></div>
                    </section>
                </div>

                {/* RIGHT: QUIZ & TOOLS */}
                <div className='lg:col-span-4 space-y-8'>
                    
                    {/* THE PHILATELIC QUIZ */}
                    <div className='bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm'>
                        <div className='flex items-center gap-3 mb-6'>
                            <Award className='text-amber-500' size={24} />
                            <h4 className='text-xs font-black uppercase tracking-widest'>Collector’s IQ Test</h4>
                        </div>
                        
                        {!activeQuiz ? (
                            <div className='text-center py-4'>
                                <p className='text-sm text-gray-500 mb-6 font-sans'>Test your knowledge and earn exclusive <span className='text-black font-bold'>Registry Points</span>.</p>
                                <button 
                                    onClick={() => setActiveQuiz(true)}
                                    className='w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#BC002D] transition-all'
                                >
                                    Start Evaluation
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-6'>
                                <p className='text-sm font-bold uppercase tracking-tight'>What does "MNH" stand for in a registry?</p>
                                <div className='space-y-3'>
                                    {['Mint National History', 'Mint Never Hinged', 'Modern New Hybrid'].map((opt, i) => (
                                        <button key={i} className='w-full p-4 border border-gray-100 rounded-xl text-xs font-bold hover:border-[#BC002D] hover:bg-[#BC002D]/5 transition-all text-left'>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* VALUATION TOOL PREVIEW */}
                    <div className='bg-gradient-to-br from-[#BC002D] to-[#80001f] rounded-[32px] p-8 text-white'>
                        <Lightbulb size={32} className='mb-6 opacity-50' />
                        <h4 className='text-lg font-bold uppercase mb-2'>Valuation Tool</h4>
                        <p className='text-[10px] text-white/60 uppercase font-black tracking-widest leading-loose mb-6'>
                            Get an instant archive estimate for your specimens.
                        </p>
                        <button className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-all'>
                            Access Tool <ChevronRight size={14} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default KnowledgeCenter;