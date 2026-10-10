import { GripHorizontal, MoreHorizontal, Maximize2, Trash2 } from 'lucide-react';
import './BentoGrid.css';

export function BentoGrid({ children, className = '' }) {
  return (
    <div className={`bento-grid ${className}`} role="region" aria-label="Bento Grid">
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  variant = 'solid',
  colorVariant = '',
  className = '',
  id,
  onDelete,
  onResize,
  showActions = false,
  ...rest
}) {
  const colClass = `bento-card--col-${Math.min(colSpan, 3)}`;
  const rowClass = `bento-card--row-${Math.min(rowSpan, 2)}`;
  const variantClass = `bento-card--${variant}`;
  const colorClass = colorVariant ? `bento-card--${colorVariant}` : '';

  return (
    <div
      className={`bento-card ${colClass} ${rowClass} ${variantClass} ${colorClass} ${className}`}
      id={id}
      role="article"
      {...rest}
    >
      {children}

      {showActions && (
        <div className="bento-card__actions">
          <button
            className="bento-card__action-btn"
            title="Mais opções"
            onClick={e => { e.stopPropagation(); }}
          >
            <MoreHorizontal size={12} />
          </button>
          {onDelete && (
            <button
              className="bento-card__action-btn"
              title="Remover"
              onClick={e => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}

      <div className="bento-card__resize-handle" title="Redimensionar">
        <GripHorizontal size={10} />
      </div>
    </div>
  );
}
