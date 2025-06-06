// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { MegaLink, CreateMegaLinkRequest } from '../types';
import { useMegaLinks } from '../hooks/useMegaLinks';
import { useAuth } from '@/contexts/AuthContext';
import { MegaLinkCard } from '../components/features/MegaLinkCard';
import { Button } from '../components/common/Button';
import { MegaLinkForm } from '../components/features/MegaLinkForm';
import './Dashboard.less';

export const Dashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  
  const {
    links,
    loading: linksLoading,
    error,
    selectedTags,
    searchTerm,
    analysisStatus,
    refreshingAll,
    createLink,
    deleteLink,
    filterByTags,
    searchLinks,
    updateLink,
    clearFilters,
    refreshLink,
    refreshAllLinks,
  } = useMegaLinks();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState<MegaLink | null>(null);

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEdit = (link: MegaLink) => {
    setEditingLink(link);
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditingLink(null);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingLink(null);
  };

  const handleSubmitForm = async (formData: CreateMegaLinkRequest) => {
    try {
      if (editingLink) {
        await updateLink(editingLink.id, formData);
      } else {
        await createLink(formData);
      }
      handleCloseForm();
    } catch (err) {
      console.error('Failed to save link:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleRefreshLink = async (id: number) => {
    try {
      await refreshLink(id);
    } catch (err) {
      console.error('Failed to refresh link:', err);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await refreshAllLinks();
    } catch (err) {
      console.error('Failed to refresh all links:', err);
    }
  };

  // Get unique tags from all links for filtering
  const allTags = Array.from(
    new Set(links.flatMap(link => link.tags))
  ).sort();

  const handleTagFilter = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    if (isSelected) {
      filterByTags(selectedTags.filter(t => t !== tag));
    } else {
      filterByTags([...selectedTags, tag]);
    }
  };

  if (authLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <p>Authentication required. Please log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__title-section">
          <h1 className="dashboard__title">Mega Drive Organizer</h1>
          <p className="dashboard__subtitle">
            Welcome back, {user.displayName}! • Manage and organize your Mega Drive folders
          </p>
          
          {/* Analysis Status Summary */}
          {analysisStatus && (
            <div className="dashboard__stats">
              <div className="dashboard__stat-grid">
                <div className="dashboard__stat">
                  <span className="dashboard__stat-label">Total Links:</span>
                  <span className="dashboard__stat-value">{analysisStatus.totalLinks}</span>
                </div>
                <div className="dashboard__stat">
                  <span className="dashboard__stat-label">Active:</span>
                  <span className="dashboard__stat-value dashboard__stat-value--success">{analysisStatus.activeLinks}</span>
                </div>
                <div className="dashboard__stat">
                  <span className="dashboard__stat-label">Videos:</span>
                  <span className="dashboard__stat-value dashboard__stat-value--videos">🎥 {analysisStatus.totalVideos}</span>
                </div>
                <div className="dashboard__stat">
                  <span className="dashboard__stat-label">Images:</span>
                  <span className="dashboard__stat-value dashboard__stat-value--images">🖼️ {analysisStatus.totalImages}</span>
                </div>
                <div className="dashboard__stat">
                  <span className="dashboard__stat-label">Total Size:</span>
                  <span className="dashboard__stat-value">{formatBytes(analysisStatus.totalSizeBytes)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="dashboard__user-actions">
          <Button 
            onClick={handleRefreshAll} 
            variant="secondary" 
            size="small"
            disabled={refreshingAll || linksLoading}

          >
            {refreshingAll ? '⟳ Refreshing...' : '🔄 Refresh All'}
          </Button>
          <Button onClick={handleLogout} variant="ghost" size="small">
            Sign Out
          </Button>
          <Button onClick={handleAddNew} variant="primary">
            Add New Link
          </Button>
        </div>
      </div>

      <div className="dashboard__filters">
        <div className="dashboard__search">
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => searchLinks(e.target.value)}
            className="dashboard__search-input"
          />
        </div>

        <div className="dashboard__tags">
          <span className="dashboard__tags-label">Filter by tags:</span>
          <div className="dashboard__tag-list">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`dashboard__tag-filter ${selectedTags.includes(tag) ? 'dashboard__tag-filter--active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="small" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="dashboard__error">
          <p>Error: {error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {linksLoading && (
        <div className="dashboard__loading">
          <p>Loading links...</p>
        </div>
      )}

      {/* Links Grid */}
      <div className="dashboard__content">
        {links.length === 0 && !linksLoading ? (
          <div className="dashboard__empty">
            <h3>No links found</h3>
            <p>Start by adding your first Mega Drive link!</p>
            <Button onClick={handleAddNew} variant="primary">
              Add Your First Link
            </Button>
          </div>
        ) : (
          <div className="dashboard__grid">
            {links.map(link => (
              <MegaLinkCard
                key={link.id}
                link={link}
                onEdit={handleEdit}
                onDelete={deleteLink}
                onOpenLink={handleOpenLink}
                onRefresh={handleRefreshLink}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="dashboard__modal">
          <div className="dashboard__modal-content">
            <h2>{editingLink ? 'Edit Link' : 'Add New Link'}</h2>
            <MegaLinkForm
              link={editingLink}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
              loading={linksLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}