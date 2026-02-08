import React, { useContext, useState, useEffect, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { 
  Gift, X, ChevronUp, Users, ArrowRight, 
  Minimize2 
} from 'lucide-react';

const UtilityBar = () => {
    const { currency, toggleCurrency, token, userPoints, navigate } = useContext(ShopContext);

    const [isExpanded, setIsExpanded] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Default position
    const [position, setPosition] = useState({ x: -200, y: -200 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartTime = useRef(0);
    const offset = useRef({ x: 0, y: 0 });

    // --- INITIAL POSITIONING ---
    useEffect(() => {
        setPosition({ 
            x: window.innerWidth - (window.innerWidth < 768 ? 80 : 150), 
            y: window.innerHeight - 100 
        });
    }, []);

    // --- DRAG LOGIC ---
    const handleStart = (e) => {
        // Record time to distinguish between drag and click
        dragStartTime.current = Date.now();
        setIsDragging(true);
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        offset.current = {
            x: clientX - position.x,
            y: clientY - position.y
        };
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        if (e.type === 'touchmove') e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const padding = 20;
        const elementWidth = isCollapsed ? 60 : 300; 
        const elementHeight = 60;

        let newX = clientX - offset.current.x;
        let newY = clientY - offset.current.y;

        // Constraint within viewport
        newX = Math.max(padding, Math.min(newX, window.innerWidth - (isCollapsed ? 80 : elementWidth / 2 + 50)));
        newY = Math.max(padding, Math.min(newY, window.innerHeight - elementHeight - padding));

        setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging]);

    const calculateValue = () => {
        const inrValue = (userPoints || 0) / 10;
        return currency === 'INR' ? inrValue : inrValue / 83;
    };

    // Helper to prevent click if item was dragged
    const wasJustDragged = () => Date.now() - dragStartTime.current > 200;

    return (
        <div 
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`, 
                transform: isCollapsed ? 'none' : 'translateX(-50%)',
                transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
            }}
            className={`fixed z-[9999] touch-none ${isDragging ? 'scale-105' : ''}`}
        >
            {/* --- 1. DETAIL PANEL --- */}
            {!isCollapsed && (
                <div className={`absolute bottom-full mb-4 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[30px] shadow-2xl w-[320px] left-1/2 -translate-x-1/2 transition-all duration-500
                    ${isExpanded ? 'max-h-[500px] opacity-100 py-6 px-6' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className='flex justify-between items-center mb-6'>
                        <h3 className='text-[10px] font-black text-white uppercase tracking-[0.3em]'>Archive Rewards</h3>
                        <X size={16} className='text-gray-500 cursor-pointer hover:text-white' onClick={() => setIsExpanded(false)} />
                    </div>
                    <div className='bg-[#BC002D] p-4 rounded-2xl flex items-center justify-between cursor-pointer' onClick={() => navigate('/referral')}>
                        <div className='flex items-center gap-3'>
                            <Users size={18} className='text-white' />
                            <p className='text-[9px] font-black text-white uppercase'>Invite Collector (+50 PTS)</p>
                        </div>
                        <ArrowRight size={14} className='text-white' />
                    </div>
                </div>
            )}

            {/* --- 2. THE BAR / BUBBLE --- */}
            <div 
                onMouseDown={handleStart} 
                onTouchStart={handleStart}
                className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? '' : 'bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl cursor-grab active:cursor-grabbing'}`}
            >
                
                {!isCollapsed ? (
                    <>
                        {/* THE ICON */}
                        <div className='bg-[#BC002D] p-2 rounded-full shadow-lg shrink-0'>
                            <Gift size={16} className='text-white' />
                        </div>

                        {/* Points Info */}
                        <div onClick={(e) => { e.stopPropagation(); if(!wasJustDragged()) setIsExpanded(!isExpanded)}} className='flex flex-col cursor-pointer shrink-0'>
                            <p className='text-[7px] font-black text-[#BC002D] uppercase leading-none mb-1'>Points</p>
                            <p className='text-[11px] font-black text-white uppercase tabular-nums'>{userPoints || 0} PTS</p>
                        </div>

                        {/* Value */}
                        <div className='h-8 w-[1px] bg-white/10 shrink-0'></div>
                        <div className='flex flex-col items-center shrink-0'>
                            <p className='text-[7px] font-black text-green-500 uppercase leading-none mb-1'>Value</p>
                            <p className='text-[10px] font-black text-white tabular-nums'>{currency} {calculateValue().toFixed(2)}</p>
                        </div>

                        {/* Currency Toggle */}
                        <div className='flex items-center bg-white/5 rounded-full p-1 border border-white/5 shrink-0' onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            {['INR', 'USD'].map((curr) => (
                                <button key={curr} onClick={() => toggleCurrency(curr)} className={`px-2 py-1 rounded-full text-[8px] font-black transition-all ${currency === curr ? 'bg-[#BC002D] text-white' : 'text-gray-500 hover:text-white'}`}>{curr}</button>
                            ))}
                        </div>

                        {/* COLLAPSE TRIGGER */}
                        <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(true)}} className='p-2 text-gray-400 hover:text-white shrink-0' onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            <Minimize2 size={16} />
                        </button>
                    </>
                ) : (
                    /* COLLAPSED GIFT BUBBLE */
                    <div className='relative'>
                        <button 
                            onMouseDown={handleStart} 
                            onTouchStart={handleStart}
                            onClick={() => { if(!wasJustDragged()) setIsCollapsed(false)}}
                            className='w-14 h-14 bg-[#BC002D] rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 active:scale-95 transition-transform cursor-grab'
                        >
                            <Gift size={26} className='text-white pointer-events-none' />
                            <span className='absolute -top-1 -right-1 bg-black text-white text-[8px] px-1.5 py-0.5 rounded-full font-black border border-white/20'>
                                {userPoints || 0}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UtilityBar;