import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { backendUrl } from '../App';

const EditBlog = ({ token}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [image, setImage] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Registry News");
    const [existingImage, setExistingImage] = useState("");

    const fetchBlogDetails = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/blog/list');
            const blog = response.data.blogs.find(item => item._id === id);
            if (blog) {
                setTitle(blog.title);
                setContent(blog.content);
                setCategory(blog.category);
                setExistingImage(blog.image);
            }
        } catch (error) {
            toast.error("Failed to load intel record");
        }
    }

    useEffect(() => { fetchBlogDetails() }, [id]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("title", title);
            formData.append("content", content);
            formData.append("category", category);
            if (image) formData.append("image", image);

            const response = await axios.post(backendUrl + "/api/blog/update", formData, { headers: { token } });
            
            if (response.data.success) {
                toast.success("Archive Record Updated");
                navigate('/list-blog');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='p-8 flex flex-col gap-6 max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100'>
            <div className='flex flex-col gap-2'>
                <p className='text-[10px] font-black uppercase tracking-widest text-[#BC002D]'>Update Intel Specimen</p>
                <label htmlFor="blog-image">
                    <img className='w-full h-64 object-cover rounded-2xl cursor-pointer border-2 border-dashed border-gray-100' 
                         src={image ? URL.createObjectURL(image) : existingImage || assets.upload_area} alt="" />
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="blog-image" hidden />
                </label>
            </div>

            <div className='w-full'>
                <p className='mb-2 text-xs font-bold text-gray-500 uppercase'>Article Category</p>
                <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#BC002D]'>
                    <option value="Registry News">Registry News</option>
                    <option value="Historical Analysis">Historical Analysis</option>
                    <option value="Rare Acquisitions">Rare Acquisitions</option>
                </select>
            </div>

            <input onChange={(e)=>setTitle(e.target.value)} value={title} className='text-3xl font-bold border-b border-gray-100 outline-none focus:border-[#BC002D] py-4' placeholder="Headline..." required />
            <textarea onChange={(e)=>setContent(e.target.value)} value={content} className='min-h-[300px] border border-gray-100 p-6 rounded-2xl outline-none focus:border-[#BC002D]' placeholder="Content..." required />
            
            <button className='bg-black text-white py-4 font-black uppercase tracking-widest rounded-xl hover:bg-[#BC002D] transition-all'>Commit Changes to Registry</button>
        </form>
    );
};

export default EditBlog;