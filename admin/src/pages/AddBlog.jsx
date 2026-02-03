import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App'


const AddBlog = ({ token}) => {
    const [image, setImage] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        // Safety check: Prevent submission if image is missing
        if (!image) {
            return toast.error("Please select a specimen image");
        }
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("image", image); // The key MUST match the backend upload.single('image')
    
        try {
            const response = await axios.post(
                backendUrl + "/api/blog/add", 
                formData, 
                { 
                    headers: { 
                        token,
                        // DO NOT set 'Content-Type' manually. 
                        // Axios/Browser will set it to 'multipart/form-data' with the correct boundary.
                    } 
                }
            );
    
            if (response.data.success) {
                toast.success(response.data.message);
                setTitle(''); 
                setContent(''); 
                setImage(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Publishing Error:", error);
            toast.error(error.response?.data?.message || "Registry sync failed");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='p-8 flex flex-col gap-6 max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100'>
            <div>
                <p className='text-[10px] font-black uppercase tracking-widest text-[#BC002D] mb-4'>Archive Publisher</p>
                <label htmlFor="blog-image">
                    <img className='w-full h-64 object-cover rounded-2xl cursor-pointer border-2 border-dashed border-gray-100' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="blog-image" hidden />
                </label>
            </div>
            <input onChange={(e)=>setTitle(e.target.value)} value={title} className='text-3xl font-bold border-b border-gray-100 outline-none focus:border-[#BC002D] py-4' placeholder="Article Headline..." required />
            <textarea onChange={(e)=>setContent(e.target.value)} value={content} className='min-h-[300px] border border-gray-100 p-6 rounded-2xl outline-none focus:border-[#BC002D]' placeholder="Write the history of this specimen..." required />
            <button className='bg-[#BC002D] text-white py-4 font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all'>Publish to Registry</button>
        </form>
    );
};

export default AddBlog