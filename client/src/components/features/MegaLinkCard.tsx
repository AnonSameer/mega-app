// src/components/features/MegaLinkCard.tsx
import React, { useState } from 'react';
import { MegaLink } from '@/types';
import { Button } from '@/components/common/Button';
import './MegaLinkCard.less';

interface MegaLinkCardProps {
  link: MegaLink;
  onEdit: (link: MegaLink) => void;
  onDelete: (id: number) => void;
  onOpenLink: (url: string) => void;
  onRefresh: (id: number) => void;
}

export const MegaLinkCard: React.FC<MegaLinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onOpenLink,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(link.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (link.isActive === true) {
      return <span className="mega-link-card__status mega-link-card__status--active" title="Link is active">🟢</span>;
    } else if (link.lastAnalyzedAt) {
      return <span className="mega-link-card__status mega-link-card__status--inactive" title={`Error: ${link.analysisError || 'Unknown error'}`}>🔴</span>;
    } else if (link.isActive === false) {
      return <span className="mega-link-card__status mega-link-card__status--inactive" title="Link is inactive">🔴</span>;
    } else {
      return <span className="mega-link-card__status mega-link-card__status--pending" title="Analysis pending">🟡</span>;
    }
  };

  const hasMediaCounts = (link.fileCount !== undefined && link.fileCount !== null) || 
                        (link.videoCount !== undefined && link.videoCount !== null) || 
                        (link.imageCount !== undefined && link.imageCount !== null);

  return (
    <div className="mega-link-card">
      <div className="mega-link-card__header">
        <div className="mega-link-card__title-section">
          <h3 className="mega-link-card__title">
            {getStatusIcon()}
            {link.title}
          </h3>
          {link.megaName && link.megaName !== link.title && (
            <p className="mega-link-card__mega-name">{link.megaName}</p>
          )}
        </div>
        <div className="mega-link-card__actions">
          <Button 
            variant="ghost" 
            size="small" 
            onClick={handleRefresh}
            disabled={isRefreshing}

          >
            {isRefreshing ? '⟳' : '🔄'}
          </Button>
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

      {/* Media Statistics */}
      {hasMediaCounts && (
        <div className="mega-link-card__stats">
          <div className="mega-link-card__stat-row">
            {link.fileCount !== undefined && link.fileCount !== null && (
              <span className="mega-link-card__stat" title="Total files">
                📁 {link.fileCount.toLocaleString()}
              </span>
            )}
            {link.videoCount !== undefined && link.videoCount !== null && link.videoCount > 0 && (
              <span className="mega-link-card__stat mega-link-card__stat--videos" title="Video files">
                🎥 {link.videoCount.toLocaleString()}
              </span>
            )}
            {link.imageCount !== undefined && link.imageCount !== null && link.imageCount > 0 && (
              <span className="mega-link-card__stat mega-link-card__stat--images" title="Image files">
                🖼️ {link.imageCount.toLocaleString()}
              </span>
            )}
          </div>
          {link.formattedSize && (
            <div className="mega-link-card__size">
              📦 {link.formattedSize}
            </div>
          )}
        </div>
      )}

      {/* Analysis Error */}
      {link.analysisError && (
        <div className="mega-link-card__error">
          <small>⚠️ {link.analysisError}</small>
        </div>
      )}

      <div className="mega-link-card__tags">
        {link.tags.map((tag, index) => (
          <span key={index} className="mega-link-card__tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="mega-link-card__footer">
        <div className="mega-link-card__dates">
          <span className="mega-link-card__date">
            Created: {formatDate(link.createdAt)}
          </span>
          {link.lastAnalyzedAt && (
            <span className="mega-link-card__date mega-link-card__date--analyzed">
              Analyzed: {formatDate(link.lastAnalyzedAt)}
            </span>
          )}
        </div>
        <Button variant="primary" size="small" onClick={handleOpenLink}>
          Open Mega Link
        </Button>
      </div>
    </div>
  );
};