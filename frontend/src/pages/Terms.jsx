import React from 'react';
import { ShieldAlert, FileText, RotateCcw, Info } from 'lucide-react';

const Terms = () => {
    return (
        <div className='bg-white min-h-screen pt-10 pb-20 px-6 md:px-16 lg:px-24 select-none animate-fade-in'>
            
            {/* --- HEADER --- */}
            <div className='mb-16'>
                <div className='flex items-center gap-4 mb-4'>
                    <span className='h-[1.5px] w-12 bg-[#BC002D]'></span>
                    <p className='text-[10px] tracking-[0.6em] text-[#BC002D] uppercase font-black'>Legal & Policy</p>
                </div>
                <h2 className='text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter uppercase'>
                    Terms of <span className='text-[#BC002D]'>Service.</span>
                </h2>
            </div>

            <div className='max-w-4xl space-y-16'>
                
                {/* --- SECTION 1: PRODUCT CONDITION --- */}
                <section>
                    <div className='flex items-center gap-3 mb-6'>
                        <ShieldAlert size={20} className='text-[#BC002D]' />
                        <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>01. Product Condition</h3>
                    </div>
                    <div className='bg-gray-50 p-8 md:p-10 rounded-br-[60px] border border-gray-100'>
                        <p className='text-[12px] md:text-sm font-medium text-gray-600 leading-relaxed mb-6'>
                            **All Images On The Website Are Referral** – Due to multiple quantity listing we cannot change image of thousands of item every time. 
                        </p>
                        <ul className='space-y-4 text-[11px] md:text-[12px] font-bold text-gray-500 uppercase tracking-wide list-disc pl-5'>
                            <li>Blocks of stamps having margins in images may have different side margins or no margin at all.</li>
                            <li>Traffic lights in blocks or single stamps may be present in image but not in the delivered item.</li>
                            <li>All images are referral except for items listed in <span className='text-[#BC002D]'>Errors/Oddities</span> category.</li>
                        </ul>
                    </div>
                </section>

                {/* --- SECTION 2: STAMP GRADING --- */}
                <section>
                    <div className='flex items-center gap-3 mb-6'>
                        <FileText size={20} className='text-[#BC002D]' />
                        <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>02. Grading Index</h3>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                        {[
                            { code: 'MNH', desc: 'Mint Never Hinged' },
                            { code: 'MLH', desc: 'Mint Lightly Hinged' },
                            { code: 'MH', desc: 'Mint Hinged (Heavy Hinge Mark)' },
                            { code: 'MM', desc: 'Mounted Mint (Unused but stuck on paper)' }
                        ].map((grade) => (
                            <div key={grade.code} className='border border-gray-100 p-6 rounded-2xl flex items-center justify-between group hover:border-[#BC002D]/20 transition-all'>
                                <span className='text-[11px] font-black text-[#BC002D]'>{grade.code}</span>
                                <span className='text-[10px] font-bold text-gray-400 uppercase'>{grade.desc}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className='bg-gray-900 text-white/80 p-8 rounded-2xl space-y-4 font-medium text-[11px] leading-loose uppercase tracking-widest'>
                        <p><span className='text-white font-black'>1990 Onwards:</span> MNH stamps are in Excellent Condition (White gum, no marks/spots).</p>
                        <p><span className='text-white font-black'>1957–1988:</span> Mixed condition. Gum side may be white or off-white/light yellow due to India's climate and older technology.</p>
                        <p><span className='text-white font-black'>Before 1957:</span> Stamps may be completely tropicalized.</p>
                    </div>
                </section>

                {/* --- SECTION 3: FDC POLICY --- */}
                <section>
                    <div className='flex items-center gap-3 mb-6'>
                        <Info size={20} className='text-[#BC002D]' />
                        <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>03. FDC Guidelines</h3>
                    </div>
                    <p className='text-[12px] text-gray-500 font-bold uppercase tracking-widest leading-loose'>
                        Cancellations on FDCs may differ from images in position and clarity. Philatelic bureau cancellations are often hand-stamped, which may result in slight smudging. These are considered general conditions and not major damage. We carefully examine each specimen to ensure you receive the best available condition.
                    </p>
                </section>

                {/* --- SECTION 4: EXCHANGE --- */}
                <section>
                    <div className='flex items-center gap-3 mb-6'>
                        <RotateCcw size={20} className='text-[#BC002D]' />
                        <h3 className='text-sm font-black uppercase tracking-[0.3em] text-gray-900'>04. Exchange Policy</h3>
                    </div>
                    <div className='border-2 border-dashed border-gray-100 p-8 rounded-[40px]'>
                        <p className='text-[12px] text-gray-600 font-medium mb-6 leading-relaxed'>
                            Accidental purchases must be intimated via email at <span className='text-[#BC002D] font-black'>Admin@philabasket.com</span> within 24 hours of receipt.
                        </p>
                        <div className='flex flex-col md:flex-row gap-8'>
                            <div className='flex-1'>
                                <p className='text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2'>Logistics</p>
                                <p className='text-[11px] font-bold text-gray-500 uppercase'>Shipping charges for exchanges are borne by the buyer.</p>
                            </div>
                            <div className='flex-1'>
                                <p className='text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2'>Processing</p>
                                <p className='text-[11px] font-bold text-gray-500 uppercase'>Exchanged material is dispatched only after receiving original items.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
};

export default Terms;