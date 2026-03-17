import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Trash2, Edit3, Plus, ChevronDown, ChevronUp, X } from 'lucide-react'
import { backendUrl } from '../App'

const TriviaManager = ({ token }) => {
  const [triviaList, setTriviaList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trivia: [],
    order: 0
  })

  // Fetch Trivia List
  const fetchTrivia = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/trivia/list')
      if (response.data.success) {
        setTriviaList(response.data.trivia)
      }
    } catch (error) {
      console.error("Failed to fetch trivia", error)
    }
  }

  useEffect(() => {
    fetchTrivia()
  }, [])

  // Add new trivia item to form
  const addTriviaItem = () => {
    setFormData({
      ...formData,
      trivia: [...formData.trivia, { question: '', options: [''], correctAnswer: 0, hint: '' }]
    })
  }

  // Remove trivia item
  const removeTriviaItem = (index) => {
    const updated = formData.trivia.filter((_, i) => i !== index)
    setFormData({ ...formData, trivia: updated })
  }

  // Update trivia item
  const updateTriviaItem = (index, field, value) => {
    const updated = [...formData.trivia]
    if (field === 'options') {
      updated[index][field] = value
    } else {
      updated[index][field] = value
    }
    setFormData({ ...formData, trivia: updated })
  }

  // Add option to trivia item
  const addOption = (index) => {
    const updated = [...formData.trivia]
    updated[index].options.push('')
    setFormData({ ...formData, trivia: updated })
  }

  // Remove option from trivia item
  const removeOption = (triviaIndex, optionIndex) => {
    const updated = [...formData.trivia]
    updated[triviaIndex].options.splice(optionIndex, 1)
    if (updated[triviaIndex].correctAnswer >= updated[triviaIndex].options.length) {
      updated[triviaIndex].correctAnswer = Math.max(0, updated[triviaIndex].options.length - 1)
    }
    setFormData({ ...formData, trivia: updated })
  }

  // Update option
  const updateOption = (triviaIndex, optionIndex, value) => {
    const updated = [...formData.trivia]
    updated[triviaIndex].options[optionIndex] = value
    setFormData({ ...formData, trivia: updated })
  }



  // Save Trivia
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (formData.trivia.length === 0) {
      toast.error("Add at least one trivia item")
      return
    }

    // Validate trivia items
    for (let i = 0; i < formData.trivia.length; i++) {
      const item = formData.trivia[i]
      if (!item.question.trim()) {
        toast.error(`Question is required for item ${i + 1}`)
        return
      }
      if (item.options.length < 2) {
        toast.error(`At least 2 options required for item ${i + 1}`)
        return
      }
      if (item.options.some(opt => !opt.trim())) {
        toast.error(`All options must be filled for item ${i + 1}`)
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        trivia: formData.trivia.map(item => ({
          question: item.question,
          options: item.options,
          correctAnswer: item.correctAnswer,
          hint: item.hint
        }))
      }

      let response
      if (editingId) {
        response = await axios.post(
          backendUrl + '/api/trivia/update',
          { id: editingId, ...payload },
          { headers: { token } }
        )
      } else {
        response = await axios.post(
          backendUrl + '/api/trivia/add',
          payload,
          { headers: { token } }
        )
      }

      if (response.data.success) {
        toast.success(editingId ? "Trivia Updated" : "Trivia Created")
        setFormData({ title: '', description: '', trivia: [], order: 0 })
        setEditingId(null)
        await fetchTrivia()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Edit Trivia
  const handleEdit = (trivia) => {
    setFormData({
      title: trivia.title,
      description: trivia.description,
      trivia: trivia.trivia.map(item => ({
        question: item.question || '',
        options: item.options || [''],
        correctAnswer: item.correctAnswer || 0,
        hint: item.hint || ''
      })),
      order: trivia.order || 0
    })
    setEditingId(trivia._id)
    setExpandedId(trivia._id)
  }

  // Delete Trivia
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trivia section?")) return

    try {
      const response = await axios.post(
        backendUrl + '/api/trivia/delete',
        { id },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success("Trivia Deleted")
        await fetchTrivia()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Cancel Edit
  const handleCancel = () => {
    setFormData({ title: '', description: '', trivia: [], order: 0 })
    setEditingId(null)
  }

  return (
    <div className='p-8 bg-white rounded-3xl shadow-sm border border-gray-100'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 tracking-tighter uppercase'>Trivia Manager</h2>
        <p className='text-[10px] font-black text-[#BC002D] tracking-widest uppercase mt-1'>Create Educational Slideshows</p>
      </div>

      {/* Add/Edit Form */}
      <div className='bg-gray-50 p-8 rounded-2xl border border-gray-100 mb-8'>
        <h3 className='text-lg font-bold mb-6 uppercase tracking-tight'>
          {editingId ? 'Edit Trivia Section' : 'Create New Trivia Section'}
        </h3>

        <div className='space-y-6'>
          {/* Title Input */}
          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>Section Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Stamp Anatomy 101"
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all'
            />
          </div>

          {/* Description Input */}
          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this trivia section"
              rows="3"
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all resize-none'
            />
          </div>

          {/* Order Input */}
          <div>
            <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2'>Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#BC002D] transition-all'
            />
          </div>

          {/* Trivia Items */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <label className='block text-[10px] font-black uppercase tracking-widest text-gray-700'>Slideshow Items *</label>
              <button
                onClick={addTriviaItem}
                className='flex items-center gap-2 px-4 py-2 bg-[#BC002D] text-white text-[10px] font-black rounded-lg hover:bg-[#80001f] transition-all'
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className='space-y-4'>
              {formData.trivia.map((item, index) => (
                <div key={index} className='bg-white p-6 border border-gray-200 rounded-xl'>
                  <div className='flex justify-between items-start mb-4'>
                    <h4 className='font-bold text-sm'>Item {index + 1}</h4>
                    <button
                      onClick={() => removeTriviaItem(index)}
                      className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all'
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className='space-y-4'>
                    {/* Question */}
                    <div>
                      <label className='block text-xs font-bold text-gray-700 mb-1'>Question *</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => updateTriviaItem(index, 'question', e.target.value)}
                        placeholder="Question or fact"
                        className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#BC002D]'
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <div className='flex items-center justify-between mb-2'>
                        <label className='block text-xs font-bold text-gray-700'>Options *</label>
                        <button
                          onClick={() => addOption(index)}
                          className='text-xs px-2 py-1 bg-[#BC002D] text-white rounded hover:bg-[#80001f]'
                        >
                          + Add Option
                        </button>
                      </div>
                      {item.options.map((option, optIndex) => (
                        <div key={optIndex} className='flex items-center gap-2 mb-2'>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={item.correctAnswer === optIndex}
                            onChange={() => updateTriviaItem(index, 'correctAnswer', optIndex)}
                            className='text-[#BC002D] focus:ring-[#BC002D]'
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#BC002D]'
                          />
                          {item.options.length > 1 && (
                            <button
                              onClick={() => removeOption(index, optIndex)}
                              className='p-1 text-red-500 hover:bg-red-50 rounded'
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Hint */}
                    <div>
                      <label className='block text-xs font-bold text-gray-700 mb-1'>Hint (Optional)</label>
                      <input
                        type="text"
                        value={item.hint}
                        onChange={(e) => updateTriviaItem(index, 'hint', e.target.value)}
                        placeholder="A helpful hint"
                        className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#BC002D]'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4 mt-8'>
          <button
            onClick={handleSave}
            disabled={loading}
            className='flex-1 py-3 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:bg-[#BC002D] transition-all disabled:opacity-50'
          >
            {loading ? 'Saving...' : editingId ? 'Update Trivia' : 'Create Trivia'}
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

      {/* Trivia List */}
      <div className='space-y-4'>
        <h3 className='text-lg font-bold mb-6 uppercase tracking-tight'>Published Trivia Sections</h3>
        
        {triviaList.length === 0 ? (
          <p className='text-center py-8 text-gray-500'>No trivia sections yet</p>
        ) : (
          triviaList.map((trivia) => (
            <div key={trivia._id} className='border border-gray-100 rounded-2xl overflow-hidden'>
              {/* Header */}
              <div className='flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all' onClick={() => setExpandedId(expandedId === trivia._id ? null : trivia._id)}>
                <div className='flex-1'>
                  <h4 className='font-bold text-lg text-gray-900'>{trivia.title}</h4>
                  <p className='text-sm text-gray-600 mt-1'>{trivia.trivia.length} items</p>
                </div>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(trivia)
                    }}
                    className='p-2 text-gray-600 hover:text-[#BC002D] transition-colors'
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(trivia._id)
                    }}
                    className='p-2 text-gray-600 hover:text-red-600 transition-colors'
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedId === trivia._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Content */}
              {expandedId === trivia._id && (
                <div className='p-6 border-t border-gray-100'>
                  {trivia.description && (
                    <p className='text-gray-600 mb-4'>{trivia.description}</p>
                  )}
                  <div className='space-y-4'>
                    {trivia.trivia.map((item, index) => (
                      <div key={index} className='p-4 bg-gray-50 rounded-lg'>
                        <p className='font-bold text-sm mb-2'>Q{index + 1}: {item.question}</p>
                        <div className='space-y-1'>
                          {item.options.map((option, optIndex) => (
                            <p key={optIndex} className={`text-sm ${optIndex === item.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </p>
                          ))}
                        </div>
                        {item.hint && (
                          <p className='text-xs text-gray-500 italic mt-2'>Hint: {item.hint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TriviaManager
