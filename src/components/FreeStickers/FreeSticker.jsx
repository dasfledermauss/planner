import { useState, useRef } from 'react';
import { X, RotateCw, GripHorizontal, Music, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import './FreeSticker.css';

export default function FreeSticker({
  sticker,
  onUpdate,
  onDelete,
  onBringToFront,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag sticker anywhere on page
  const handleMouseDown = (e) => {
    if (e.target.closest('input, textarea, button, .free-sticker__resize-handle, .free-sticker__btn')) return;

    onBringToFront(sticker.id);
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = sticker.x || 50;
    const initialY = sticker.y || 50;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onUpdate(sticker.id, {
        x: initialX + dx,
        y: initialY + dy,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Resize sticker width
  const handleResizeDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const initialWidth = sticker.width || 220;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const newWidth = Math.max(120, Math.min(600, initialWidth + dx));
      onUpdate(sticker.id, { width: newWidth });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Rotate sticker tilt
  const cycleRotation = (e) => {
    e.stopPropagation();
    const current = sticker.rotation || 0;
    // Cycle between -3deg, 0deg, 3deg, -2deg, 2deg
    const rotations = [-3, 0, 3, -1.5, 1.5];
    const currentIndex = rotations.indexOf(current);
    const nextRot = rotations[(currentIndex + 1) % rotations.length];
    onUpdate(sticker.id, { rotation: nextRot });
  };

  const style = {
    left: `${sticker.x}px`,
    top: `${sticker.y}px`,
    width: `${sticker.width}px`,
    zIndex: sticker.zIndex || 10,
    transform: `rotate(${sticker.rotation || 0}deg)`,
    background: sticker.bg || '#FFF8E7',
    color: sticker.textColor || '#2D3748',
  };

  return (
    <div
      className={`free-sticker ${isDragging ? 'is-dragging' : ''} free-sticker--${sticker.stickerType || 'default'}`}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={() => onBringToFront(sticker.id)}
      role="region"
      aria-label="Adesivo livre"
    >
      {/* Controls Overlay (shown on hover) */}
      <div className="free-sticker__controls">
        <button
          className="free-sticker__btn"
          onClick={cycleRotation}
          title="Inclinar adesivo"
        >
          <RotateCw size={11} />
        </button>
        <button
          className="free-sticker__btn free-sticker__btn--delete"
          onClick={(e) => { e.stopPropagation(); onDelete(sticker.id); }}
          title="Remover adesivo"
        >
          <X size={12} />
        </button>
      </div>

      {/* STICKER BODY DISPATCH */}
      {sticker.stickerType === 'prompt' && (
        <div className="free-sticker__content free-sticker__prompt">
          <input
            className="free-sticker__prompt-title"
            value={sticker.prompt || ''}
            onChange={e => onUpdate(sticker.id, { prompt: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            placeholder="PROMPT DO DIA:"
          />
          <input
            className="free-sticker__prompt-input"
            value={sticker.text || ''}
            onChange={e => onUpdate(sticker.id, { text: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            placeholder="escreva aqui..."
          />
        </div>
      )}

      {sticker.stickerType === 'badge' && (
        <div className="free-sticker__content free-sticker__badge">
          <input
            className="free-sticker__badge-input"
            value={sticker.text || ''}
            onChange={e => onUpdate(sticker.id, { text: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            placeholder="I GOT THIS."
          />
        </div>
      )}

      {sticker.stickerType === 'quote' && (
        <div className="free-sticker__content free-sticker__quote">
          <input
            className="free-sticker__quote-author"
            value={sticker.author || ''}
            onChange={e => onUpdate(sticker.id, { author: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            placeholder="✦ Lembrete"
          />
          <textarea
            className="free-sticker__quote-text"
            value={sticker.text || ''}
            onChange={e => onUpdate(sticker.id, { text: e.target.value })}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Frase inspiradora..."
            rows={2}
          />
        </div>
      )}

      {sticker.stickerType === 'player' && (
        <div className="free-sticker__content free-sticker__player">
          <div className="sticker-player__top">
            <div className="sticker-player__meta">
              <span className="sticker-player__title-text">{sticker.title || 'Throw Some D\'s'}</span>
              <span className="sticker-player__artist-text">{sticker.artist || 'Rich Boy'}</span>
            </div>
            <Music size={14} style={{ opacity: 0.6 }} />
          </div>
          <div className="sticker-player__progress-bar">
            <div className="sticker-player__progress-fill" style={{ width: isPlaying ? '70%' : '35%' }} />
          </div>
          <div className="sticker-player__controls">
            <button className="sticker-player__btn" title="Anterior"><SkipBack size={12} /></button>
            <button
              className="sticker-player__btn sticker-player__btn--play"
              onClick={(e) => { e.stopPropagation(); setIsPlaying(p => !p); }}
              title={isPlaying ? 'Pausar' : 'Tocar'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button className="sticker-player__btn" title="Próxima"><SkipForward size={12} /></button>
          </div>
        </div>
      )}

      {/* Resize Handle (bottom-right corner) */}
      <div
        className="free-sticker__resize-handle"
        onMouseDown={handleResizeDown}
        title="Redimensionar adesivo"
      >
        <GripHorizontal size={10} />
      </div>
    </div>
  );
}
