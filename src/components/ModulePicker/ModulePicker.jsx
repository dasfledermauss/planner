import { Plus, X } from 'lucide-react';
import './ModulePicker.css';

const MODULE_GROUPS = [
  {
    label: 'Texto & Estrutura',
    modules: [
      { type: 'heading',   icon: 'H',  label: 'Título',      emoji: null },
      { type: 'paragraph', icon: '¶',  label: 'Parágrafo',   emoji: null },
      { type: 'note',      icon: '✦',  label: 'Nota',        emoji: null },
      { type: 'checklist', icon: '✓',  label: 'Checklist',   emoji: null },
      { type: 'divider',   icon: '—',  label: 'Divisor',     emoji: null },
    ],
  },
  {
    label: 'Widgets do Planner',
    modules: [
      { type: 'habits',    icon: '🔥', label: 'Hábitos',       emoji: true },
      { type: 'mood',      icon: '😊', label: 'Humor do Dia',  emoji: true },
      { type: 'minical',   icon: '📅', label: 'Calendário',    emoji: true },
      { type: 'links',     icon: '🔗', label: 'Links Rápidos', emoji: true },
      { type: 'shelves',   icon: '📚', label: 'Prateleiras',   emoji: true },
    ],
  },
  {
    label: 'Mídia & Código',
    modules: [
      { type: 'image',     icon: '🖼',  label: 'Imagem',        emoji: true },
      { type: 'code',      icon: '<>', label: 'HTML / Código', emoji: null },
    ],
  },
  {
    label: 'Adesivos & Decorativo',
    modules: [
      { type: 'stickers_panel', icon: '✨', label: 'Cartela de Adesivos', emoji: true, action: 'open_stickers' },
    ],
  },
];

export default function ModulePicker({ open, onClose, onAdd, onOpenStickers }) {
  if (!open) return null;

  const handleAdd = (mod) => {
    if (mod.action === 'open_stickers' || mod.type === 'stickers_panel') {
      if (onOpenStickers) onOpenStickers();
    } else {
      onAdd(mod.type);
    }
    onClose();
  };

  return (
    <>
      <div
        className="picker-backdrop"
        id="picker-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="picker" id="module-picker" role="dialog" aria-label="Adicionar bloco">
        <div className="picker__header">
          <div>
            <div className="picker__title">Adicionar bloco à página</div>
            <div className="picker__subtitle">Escolha o elemento que deseja incluir</div>
          </div>
          <button
            style={{
              width: 28, height: 28,
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-3)',
              cursor: 'pointer',
              transition: 'background var(--dur-fast)',
            }}
            onClick={onClose}
            id="picker-close"
            aria-label="Fechar"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={14} />
          </button>
        </div>

        {MODULE_GROUPS.map(group => (
          <div key={group.label}>
            <div className="picker__section-label">{group.label}</div>
            <div className="picker__grid">
              {group.modules.map(mod => (
                <button
                  key={mod.type}
                  className="picker__module-btn"
                  id={`picker-add-${mod.type}`}
                  onClick={() => handleAdd(mod)}
                  title={`Adicionar ${mod.label}`}
                >
                  <div className="picker__module-icon">
                    <span style={{
                      fontFamily: mod.emoji ? 'inherit' : 'monospace',
                      fontSize: mod.emoji ? 16 : 13,
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                    }}>
                      {mod.icon}
                    </span>
                  </div>
                  <span className="picker__module-label">{mod.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function FAB({ open, onClick }) {
  return (
    <button
      className={`fab${open ? ' open' : ''}`}
      id="fab-add"
      onClick={onClick}
      aria-label={open ? 'Fechar menu de blocos' : 'Adicionar bloco'}
      title="Adicionar bloco à página"
    >
      <Plus size={22} />
    </button>
  );
}
