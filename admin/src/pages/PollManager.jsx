import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Trash2, Edit3, Plus, X, BarChart3 } from 'lucide-react'
import { backendUrl } from '../App'

const PollManager = ({ token }) => {
  const [poll, setPoll] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    options: ['', '', '', ''],
    endDate: ''
  })

  // Fetch Active Poll
  const fetchPoll = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/poll/list', { headers: { token } })
      if (response.data.success) {
        setPoll(response.data.poll)
      }
    } catch (error) {
      console.error("Failed to fetch poll", error)
    }
  }

  useEffect(() => {
    fetchPoll()
  }, [])

  // Update form data
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Update option
  const handleOptionChange = (index, value) => {
    const updated = [...formData.options]
    updated[index] = value
    setFormData(prev => ({ ...prev, options: updated }))
  }

  // Add option
  const addOption = () => {
    if (formData.options.length < 8) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }))
    }
  }

  // Remove option
  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const updated = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, options: updated }))
    }
  }

  // Save Poll
  const handleSave = async () => {
    if (!formData.question.trim()) {
      toast.error("Question is required")
      return
    }
    if (formData.options.some(opt => !opt.trim()) || formData.options.length < 2) {
      toast.error("At least 2 valid options required")
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: formData.title.trim(),
        question: formData.question.trim(),
        options: formData.options.map(opt => opt.trim()).filter(Boolean),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      }

      let response
      if (editingId) {
        response = await axios.post(backendUrl + '/api/poll/update', { id: editingId, ...payload }, { headers: { token } })
      } else {
        response = await axios.post(backendUrl + '/api/poll/add', payload, { headers: { token } })
      }

      if (response.data.success) {
        toast.success(editingId ? "Poll Updated" : "Poll Created")
        setFormData({ title: '', question: '', options: ['', '', '', ''], endDate: '' })
        setEditingId(null)
        await fetchPoll()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save poll')
    } finally {
      setLoading(false)
    }
  }

  // Load poll for editing
  const handleEdit = () => {
    if (poll) {
      setFormData({
        title: poll.title,
        question: poll.question,
        options: poll.options.map(opt => opt.text),
        endDate: poll.endDate ? new Date(poll.endDate).toISOString().slice(0, 16) : ''
      })
      setEditingId(poll._id)
    }
  }

  // Delete Poll
  const handleDelete = async () => {
    if (!poll || !window.confirm("Delete active poll?")) return

    try {
      const response = await axios.post(backendUrl + '/api/poll/delete', { id: poll._id }, { headers: { token } })
      if (response.data.success) {
        toast.success("Poll Deleted")
        setPoll(null)
        setFormData({ title: '', question: '', options: ['', '', '', ''], endDate: '' })
        setEditingId(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete')
    }
  }

  // Cancel Edit
  const handleCancel = () => {
    setFormData({ title: '', question: '', options: ['', '', '', ''], endDate: '' })
    setEditingId(null)
  }

  return (
    <div className='p-8 bg-white rounded-3xl shadow-sm border border-gray-100 min-h-screen'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 tracking-tighter uppercase'>Poll Manager</h2>
        <p className='text-[10px] font-black text-[#BC002D] tracking-widest uppercase mt-1'>Engage visitors with interactive polls</p>
      </div>

      {/* Form */}
      <div className='bg-gray-50 p-8 rounded-2xl border border-gray-100 mb-8'>
        <h3 className='text-lg font-bold mb-6 uppercase tracking-tight'>
          {editingId ? 'Edit Poll' : 'Create/Edit Active Poll'}
        </h3>

        <div className='space-y-6'>
          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Favorite Stamp Era?"
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all'
            />
          </div>

          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="What is your favorite collecting category?"
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all'
            />
          </div>

          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>Options (2-8) *</label>
            <div className='space-y-3'>
              {formData.options.map((option, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <span className='w-6 font-bold text-gray-500'>{String.fromCharCode(65 + index)}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className='flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all text-sm'
                  />
                  {formData.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all'
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {formData.options.length < 8 && (
                <button
                  onClick={addOption}
                  className='flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-xl hover:border-[#BC002D] hover:text-[#BC002D] transition-all'
                >
                  <Plus size={14} /> Add Option
                </button>
              )}
            </div>
          </div>

          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>End Date (Optional)</label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all'
            />
          </div>
        </div>

        <div className='flex gap-4 mt-8'>
          <button
            onClick={handleSave}
            disabled={loading}
            className='flex-1 py-3 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:bg-[#BC002D] transition-all disabled:opacity-50'
          >
            {loading ? 'Saving...' : editingId ? 'Update Poll' : 'Create Poll'}
          </button>
          {editingId && (
            <button
              onClick={handleCancel}
              className='flex-1 py-3 bg-gray-300 text-gray-900 text-[10px] font-black uppercase rounded-xl hover:bg-gray-400 transition-all'
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Current Poll Preview */}
      {poll && (
        <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-bold'>Active Poll Preview</h4>
            <div className='flex gap-2'>
              <button onClick={handleEdit} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg'><Edit3 size={16}/></button>
              <button onClick={handleDelete} className='p-2 text-red-600 hover:bg-red-50 rounded-lg'><Trash2 size={16}/></button>
              <button onClick={() => window.open('/knowledge-center', '_blank')} className='px-4 py-2 bg-[#BC002D] text-white text-xs font-bold rounded-lg'>Preview</button>
            </div>
          </div>
          
          <div className='p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl'>
            <h5 className='font-bold text-lg mb-2'>{poll.title}</h5>
            <p className='text-xl font-serif mb-6'>{poll.question}</p>
            <div className='space-y-2'>
              {poll.options.map((option, index) => (
                <div key={index} className='flex items-center justify-between p-3 bg-white rounded-lg'>
                  <span>{String.fromCharCode(65 + index)}. {option.text}</span>
                  <span className='text-sm text-gray-500'>({option.votes} votes)</span>
                </div>
              ))}
            </div>
            {poll.endDate && (
              <p className='text-xs text-gray-500 mt-4'>Ends: {new Date(poll.endDate).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PollManager

