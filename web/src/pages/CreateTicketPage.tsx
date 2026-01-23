import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Ticket } from '../types/ticket'

function CreateTicketPage() {
  const { apiClient } = useAuth()
  const navigate = useNavigate()
  
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (subject.trim().length === 0) {
      newErrors.subject = 'Subject is required (1-255 characters)'
    } else if (subject.trim().length > 255) {
      newErrors.subject = 'Subject must be 255 characters or less'
    }

    if (description.trim().length === 0) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      
      const response = await apiClient.post<Ticket>('/api/v1/tickets', {
        subject: subject.trim(),
        description: description.trim(),
        priority,
        tags: tagsArray
      })

      navigate(`/ticket/${response.id}`)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create ticket' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Create New Ticket</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="subject" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Subject *
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={255}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px',
              border: errors.subject ? '1px solid red' : '1px solid #ccc'
            }}
            disabled={isSubmitting}
          />
          {errors.subject && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.subject}</div>}
        </div>

        <div>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px',
              border: errors.description ? '1px solid red' : '1px solid #ccc',
              resize: 'vertical'
            }}
            disabled={isSubmitting}
          />
          {errors.description && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>{errors.description}</div>}
        </div>

        <div>
          <label htmlFor="priority" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
            style={{ padding: '10px', fontSize: '14px' }}
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., billing, urgent, bug"
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            disabled={isSubmitting}
          />
        </div>

        {errors.submit && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {errors.submit}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px', 
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
            style={{ 
              padding: '10px 20px', 
              fontSize: '14px', 
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTicketPage
