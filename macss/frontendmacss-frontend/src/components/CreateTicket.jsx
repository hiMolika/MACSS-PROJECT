// CreateTicket.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  const categories = [
    { id: 'technical', name: 'Technical Support' },
    { id: 'billing', name: 'Billing & Payments' },
    { id: 'account', name: 'Account Management' },
    { id: 'product', name: 'Product Information' },
    { id: 'feedback', name: 'Feedback & Suggestions' },
    { id: 'other', name: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Generate suggestions based on description
    if (name === 'description' && value.length > 30) {
      // This would typically be an API call to suggest solutions
      setTimeout(() => {
        if (value.toLowerCase().includes('password') || value.toLowerCase().includes('login')) {
          setSuggestions([
            'Have you tried resetting your password using the "Forgot Password" link?',
            'Clear your browser cache and cookies, then try logging in again.',
            'Make sure Caps Lock is not enabled when typing your password.'
          ]);
        } else if (value.toLowerCase().includes('billing') || value.toLowerCase().includes('payment')) {
          setSuggestions([
            'Check if your payment method has expired or needs to be updated.',
            'Verify that your billing address matches your credit card information.',
            'Contact your bank to ensure the transaction is not being blocked.'
          ]);
        } else {
          setSuggestions([]);
        }
      }, 500);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/tickets');
    }, 1500);
  };

  return (
    <div className="create-ticket-container">
      <div className="create-ticket-header">
        <h1 className="create-ticket-title">Create New Ticket</h1>
        <p className="create-ticket-subtitle">Submit a new support request</p>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">Ticket Information</h2>
          <p className="form-subtitle">Please provide detailed information about your issue</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="subject" className="field-label">
                Subject<span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`text-input ${errors.subject ? 'error' : ''}`}
                placeholder="Brief summary of your issue"
                value={formData.subject}
                onChange={handleChange}
              />
              {errors.subject && <p className="error-text">{errors.subject}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="category" className="field-label">
                Category<span className="required-indicator">*</span>
              </label>
              <select
                id="category"
                name="category"
                className={`select-input ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {errors.category && <p className="error-text">{errors.category}</p>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description" className="field-label">
              Description<span className="required-indicator">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={`textarea-input ${errors.description ? 'error' : ''}`}
              placeholder="Please provide details about your issue..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>

          <div className="form-field">
            <label className="field-label">Priority</label>
            <div className="priority-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={formData.priority === 'low'}
                  onChange={handleChange}
                  className="radio-input"
                />
                <span className="radio-label">Low</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="priority"
                  value="medium"
                  checked={formData.priority === 'medium'}
                  onChange={handleChange}
                  className="radio-input"
                />
                <span className="radio-label">Medium</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={formData.priority === 'high'}
                  onChange={handleChange}
                  className="radio-input"
                />
                <span className="radio-label">High</span>
              </label>
            </div>
          </div>

          <div className="attachments-section">
            <label className="attachments-label">Attachments</label>
            <div className="attachments-input-container">
              <label className="file-input-button">
                <svg className="file-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                Add Files
                <input type="file" className="file-input" multiple onChange={handleFileChange} />
              </label>
              <span className="files-count">
                {formData.attachments.length > 0
                  ? `${formData.attachments.length} file(s) selected`
                  : 'No files selected'}
              </span>
            </div>

            {formData.attachments.length > 0 && (
              <div className="file-list">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span className="file-name">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file-button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-button">
                  <div className="loading-spinner"></div>
                  Creating...
                </div>
              ) : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;