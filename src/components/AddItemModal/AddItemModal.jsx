import { useState, useRef, useEffect } from 'react';
import { BookOpen, Film, X, Plus, ImagePlus } from 'lucide-react';
import './AddItemModal.css';

export default function AddItemModal({ open, defaultType = 'book', onClose, onAdd }) {
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');      // author or director
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverData, setCoverData] = useState(null);
  const titleRef = useRef(null);

  // Sync default type when modal opens
  useEffect(() => {
    if (open) {
      setType(defaultType);
      setTitle('');
      setSub('');
      setProgress(0);
      setRating(5);
      setHoverRating(0);
      setCoverPreview(null);
      setCoverData(null);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, defaultType]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverPreview(ev.target.result);
      setCoverData(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === 'book') {
      onAdd('book', {
        id: Date.now(),
        title: title.trim(),
        author: sub.trim() || 'Autor desconhecido',
        progress,
        status: progress === 0 ? 'Para ler' : progress === 100 ? 'Lido ✓' : `${progress}% lido`,
        cover: coverData,
      });
    } else {
      onAdd('film', {
        id: Date.now(),
        title: title.trim(),
        director: sub.trim() || 'Diretor desconhecido',
        rating,
        cover: coverData,
      });
    }
    onClose();
  };

  if (!open) return null;

  const isBook = type === 'book';

  return (
    <div className="add-item-backdrop" onClick={onClose}>
      <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="add-item-modal__header">
          <div className="add-item-modal__icon">
            {isBook ? <BookOpen size={18} /> : <Film size={18} />}
          </div>
          <div className="add-item-modal__title-group">
            <div className="add-item-modal__title">
              Adicionar {isBook ? 'Livro' : 'Filme'}
            </div>
            <div className="add-item-modal__subtitle">
              {isBook
                ? 'Registre um livro na sua prateleira do planner'
                : 'Marque um filme na sua lista de filmes'}
            </div>
          </div>
          <button className="add-item-modal__close" onClick={onClose} title="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* Type selector */}
        <div className="add-item-modal__type-row">
          <button
            type="button"
            className={`add-item-type-btn${type === 'book' ? ' active' : ''}`}
            onClick={() => setType('book')}
          >
            <BookOpen size={14} />
            Livro
          </button>
          <button
            type="button"
            className={`add-item-type-btn${type === 'film' ? ' active' : ''}`}
            onClick={() => setType('film')}
          >
            <Film size={14} />
            Filme
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Cover + Fields */}
          <div className="add-item-modal__cover-section">
            {/* Cover Upload */}
            <label className="add-item-cover-upload" title={isBook ? 'Clique para carregar capa' : 'Clique para carregar pôster'}>
              <input type="file" accept="image/*" onChange={handleCoverChange} />
              <div className="add-item-cover-box">
                {coverPreview ? (
                  <img src={coverPreview} alt="Capa" />
                ) : (
                  <>
                    <ImagePlus size={20} />
                    <span>{isBook ? '+ Capa' : '+ Pôster'}</span>
                  </>
                )}
              </div>
            </label>

            {/* Fields */}
            <div className="add-item-modal__fields">
              <div className="add-item-field">
                <label htmlFor="add-item-title">Título *</label>
                <input
                  id="add-item-title"
                  ref={titleRef}
                  type="text"
                  placeholder={isBook ? 'Nome do livro...' : 'Nome do filme...'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="add-item-field">
                <label htmlFor="add-item-sub">
                  {isBook ? 'Autor' : 'Diretor'}
                </label>
                <input
                  id="add-item-sub"
                  type="text"
                  placeholder={isBook ? 'Nome do autor...' : 'Nome do diretor...'}
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                />
              </div>

              {isBook ? (
                <div className="add-item-field">
                  <label>Progresso de leitura: {progress}%</label>
                  <div className="add-item-progress-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                    />
                    <span>{progress}%</span>
                  </div>
                </div>
              ) : (
                <div className="add-item-field">
                  <label>Avaliação</label>
                  <div className="add-item-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`add-item-star${(hoverRating || rating) >= star ? ' filled' : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="add-item-modal__footer">
            <button type="button" className="add-item-modal__cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="add-item-modal__submit"
              disabled={!title.trim()}
            >
              <Plus size={14} />
              Adicionar à prateleira
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
