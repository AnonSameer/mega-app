import React, { useState, useEffect } from 'react';
import { MegaLink, CreateMegaLinkRequest } from '@/types';
import { Button } from '@/components/common/Button';
import './MegaLinkForm.less';

interface MegaLinkFormProps {
  link?: MegaLink | null;
  onSubmit: (data: CreateMegaLinkRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const MegaLinkForm: React.FC<MegaLinkFormProps> = ({
  link,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateMegaLinkRequest>({
    title: '',
    url: '',
    description: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-populate form if editing
  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        description: link.description,
        tags: [...link.tags],
      });
    }
  }, [link]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!formData.url.includes('mega.nz')) {
      newErrors.url = 'Please enter a valid Mega.nz URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mega-link-form">
      <div className="mega-link-form__field">
        <label htmlFor="title" className="mega-link-form__label">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`mega-link-form__input ${errors.title ? 'mega-link-form__input--error' : ''}`}
          placeholder="Enter a descriptive title"
          disabled={loading}
        />
        {errors.title && (
          <span className="mega-link-form__error">{errors.title}</span>
        )}
      </div>

      <div className="mega-link-form__field">
        <label htmlFor="url" className="mega-link-form__label">
          Mega.nz URL *
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          className={`mega-link-form__input ${errors.url ? 'mega-link-form__input--error' : ''}`}
          placeholder="https://mega.nz/folder/..."
          disabled={loading}
        />
        {errors.url && (
          <span className="mega-link-form__error">{errors.url}</span>
        )}
      </div>

      <div className="mega-link-form__field">
        <label htmlFor="description" className="mega-link-form__label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="mega-link-form__textarea"
          placeholder="Optional description of the folder contents"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="mega-link-form__field">
        <label className="mega-link-form__label">Tags</label>
        <div className="mega-link-form__tag-input">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            className="mega-link-form__input"
            placeholder="Add a tag and press Enter"
            disabled={loading}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="secondary"
            size="small"
            disabled={!tagInput.trim() || loading}
          >
            Add Tag
          </Button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="mega-link-form__tags">
            {formData.tags.map((tag, index) => (
              <span key={index} className="mega-link-form__tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="mega-link-form__tag-remove"
                  disabled={loading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mega-link-form__actions">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {link ? 'Update Link' : 'Create Link'}
        </Button>
      </div>
    </form>
  );
};