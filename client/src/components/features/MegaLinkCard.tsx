// src/components/features/MegaLinkCard.tsx
import React from 'react';
import { MegaLink } from '@/types';
import { Button } from '@/components/common/Button';
import './MegaLinkCard.less';

interface MegaLinkCardProps {
  link: MegaLink;
  onEdit: (link: MegaLink) => void;
  onDelete: (id: number) => void;
  onOpenLink: (url: string) => void;
}

export const MegaLinkCard: React.FC<MegaLinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onOpenLink,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOpenLink = () => {
    onOpenLink(link.url);
  };

  const handleEdit = () => {
    onEdit(link);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${link.title}"?`)) {
      onDelete(link.id);
    }
  };

  return (
    <div className="mega-link-card">
      <div className="mega-link-card__header">
        <h3 className="mega-link-card__title">{link.title}</h3>
        <div className="mega-link-card__actions">
          <Button variant="ghost" size="small" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {link.description && (
        <p className="mega-link-card__description">{link.description}</p>
      )}

      <div className="mega-link-card__tags">
        {link.tags.map((tag, index) => (
          <span key={index} className="mega-link-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="mega-link-card__footer">
        <span className="mega-link-card__date">
          Created: {formatDate(link.createdAt)}
        </span>
        <Button variant="primary" size="small" onClick={handleOpenLink}>
          Open Mega Link
        </Button>
      </div>
    </div>
  );
};