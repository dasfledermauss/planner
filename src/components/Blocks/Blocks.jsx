import { useState, useRef, useCallback, useEffect } from 'react';
import {
  CheckCircle2, Image, Trash2, MoreVertical,
  Play, Pause, SkipForward, SkipBack, Music
} from 'lucide-react';
import MiniCalendarContent from './MiniCalendarContent';
import HabitsContent from './HabitsContent';
import MoodContent from './MoodContent';
import LinksContent from './LinksContent';
import ShelvesContent from './ShelvesContent';
import './Blocks.css';

/* -------------------------------------------------- */
/* BLOCK MENU (3-dots dropdown for col resize + delete)*/
/* -------------------------------------------------- */
export function BlockMenu({ colSpan, onResize, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="block-controls" ref={menuRef} onClick={e => e.stopPropagation()}>
      <button
        className={`block-menu-trigger${open ? ' active' : ''}`}
        onClick={() => setOpen(p => !p)}
        title="Opções do bloco"
        aria-label="Opções do bloco"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="block-dropdown-menu" role="menu">
          <div className="block-dropdown-menu__label">Largura</div>
          <div className="block-dropdown-menu__cols">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                className={`block-dropdown-menu__col-btn${colSpan === n ? ' active' : ''}`}
                onClick={() => { onResize(n); setOpen(false); }}
                title={`${n} coluna${n > 1 ? 's' : ''}`}
              >
                {n} {n === 1 ? 'col' : 'cols'}
              </button>
            ))}
          </div>

          <div className="block-dropdown-menu__divider" />

          <button
            className="block-dropdown-menu__item block-dropdown-menu__item--danger"
            onClick={() => { onDelete(); setOpen(false); }}
          >
            <Trash2 size={12} />
            <span>Excluir bloco</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* HEADING BLOCK                                       */
/* -------------------------------------------------- */
export function HeadingBlock({ data, onChange }) {
  return (
    <div className="block-heading">
      <input
        className="block-heading__input"
        placeholder="Título..."
        value={data.text || ''}
        onChange={e => onChange({ ...data, text: e.target.value })}
        id={`heading-input-${data.id}`}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* PARAGRAPH BLOCK                                     */
/* -------------------------------------------------- */
export function ParagraphBlock({ data, onChange }) {
  const ref = useRef(null);

  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="block-paragraph">
      <textarea
        ref={ref}
        className="block-paragraph__input"
        placeholder="Escreva algo..."
        value={data.text || ''}
        onChange={e => { onChange({ ...data, text: e.target.value }); autoResize(); }}
        onInput={autoResize}
        id={`para-input-${data.id}`}
        rows={3}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* NOTE BLOCK                                          */
/* -------------------------------------------------- */
export function NoteBlock({ data, onChange }) {
  const ref = useRef(null);
  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };
  return (
    <div className="block-note">
      <textarea
        ref={ref}
        className="block-note__input"
        placeholder="Uma nota, citação ou ideia..."
        value={data.text || ''}
        onChange={e => { onChange({ ...data, text: e.target.value }); autoResize(); }}
        onInput={autoResize}
        id={`note-input-${data.id}`}
        rows={3}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* DIVIDER BLOCK                                       */
/* -------------------------------------------------- */
export function DividerBlock() {
  return (
    <div className="block-divider">
      <div className="block-divider__line" />
      <div className="block-divider__dot" />
      <div className="block-divider__line" />
    </div>
  );
}

/* -------------------------------------------------- */
/* IMAGE BLOCK                                         */
/* -------------------------------------------------- */
export function ImageBlock({ data, onChange }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onChange({ ...data, src: e.target.result, name: file.name });
    reader.readAsDataURL(file);
  }, [data, onChange]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  if (data.src) {
    return (
      <div className="block-image">
        <img src={data.src} alt={data.caption || data.name || 'imagem'} className="block-image__img" />
        <input
          className="block-image__caption-input"
          placeholder="Adicionar legenda..."
          value={data.caption || ''}
          onChange={e => onChange({ ...data, caption: e.target.value })}
          id={`img-caption-${data.id}`}
        />
        <button
          onClick={() => onChange({ ...data, src: null })}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,0.5)', color: '#fff',
            border: 'none', borderRadius: 6, padding: '4px 8px',
            fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
          id={`img-remove-${data.id}`}
        >
          <Trash2 size={11} /> trocar
        </button>
      </div>
    );
  }

  return (
    <div
      className={`block-image__drop-zone${isDragOver ? ' drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      id={`img-zone-${data.id}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="block-image__hidden-input"
        onChange={e => handleFile(e.target.files[0])}
        id={`img-file-${data.id}`}
      />
      <div className="block-image__drop-icon">
        <Image size={18} />
      </div>
      <span className="block-image__drop-label">Clique ou arraste uma imagem</span>
      <span className="block-image__drop-sub">PNG, JPG, GIF, WebP</span>
    </div>
  );
}

/* -------------------------------------------------- */
/* CHECKLIST BLOCK                                     */
/* -------------------------------------------------- */
export function ChecklistBlock({ data, onChange }) {
  const addItem = () => {
    const items = [...(data.items || []), { id: Date.now(), text: '', done: false }];
    onChange({ ...data, items });
  };

  const updateItem = (id, patch) => {
    const items = (data.items || []).map(it => it.id === id ? { ...it, ...patch } : it);
    onChange({ ...data, items });
  };

  const removeItem = (id) => {
    const items = (data.items || []).filter(it => it.id !== id);
    onChange({ ...data, items });
  };

  const items = data.items || [];

  return (
    <div className="block-checklist">
      <div className="block-checklist__header">
        <input
          className="block-checklist__title"
          placeholder="Título da lista..."
          value={data.title || ''}
          onChange={e => onChange({ ...data, title: e.target.value })}
          id={`checklist-title-${data.id}`}
        />
        <button className="block-checklist__add" onClick={addItem} id={`checklist-add-${data.id}`}>
          + Item
        </button>
      </div>

      {items.map(item => (
        <div key={item.id} className="checklist-item">
          <button
            className={`checklist-item__check${item.done ? ' done' : ''}`}
            onClick={() => updateItem(item.id, { done: !item.done })}
            id={`check-${item.id}`}
          >
            {item.done && <CheckCircle2 size={11} />}
          </button>
          <input
            className={`checklist-item__text${item.done ? ' done' : ''}`}
            placeholder="Item..."
            value={item.text}
            onChange={e => updateItem(item.id, { text: e.target.value })}
            id={`check-text-${item.id}`}
          />
          <button
            className="checklist-item__delete"
            onClick={() => removeItem(item.id)}
            title="Remover item"
            id={`check-del-${item.id}`}
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <button className="block-checklist__add" onClick={addItem} style={{ marginTop: 0 }}>
          + Adicionar primeiro item
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* CODE / HTML BLOCK                                   */
/* -------------------------------------------------- */
export function CodeBlock({ data, onChange }) {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="block-code">
      <div className="block-code__label">
        <div className="block-code__dot" />
        HTML / Código
        <button
          style={{
            marginLeft: 'auto', fontSize: 10, color: 'var(--color-primary)',
            cursor: 'pointer', fontWeight: 600,
          }}
          onClick={() => setShowPreview(p => !p)}
          id={`code-preview-${data.id}`}
        >
          {showPreview ? 'Editar' : 'Preview'}
        </button>
      </div>
      {showPreview ? (
        <div
          className="block-code__preview"
          dangerouslySetInnerHTML={{ __html: data.code || '<em style="color:#999">Nenhum código ainda</em>' }}
        />
      ) : (
        <textarea
          className="block-code__textarea"
          placeholder={'<div>Seu HTML aqui...</div>'}
          value={data.code || ''}
          onChange={e => onChange({ ...data, code: e.target.value })}
          id={`code-input-${data.id}`}
          rows={5}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* MINI CALENDAR BLOCK                                 */
/* -------------------------------------------------- */
export function MiniCalBlock() {
  return (
    <div className="block-minical">
      <MiniCalendarContent />
    </div>
  );
}

/* -------------------------------------------------- */
/* STICKER / ADESIVO BLOCK (inspired by planner ref)  */
/* -------------------------------------------------- */
export function StickerBlock({ data, onChange }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (data.stickerType === 'player') {
    return (
      <div
        className="block-sticker block-sticker--player"
        style={{ background: data.bg || '#D9E2EC', color: data.textColor || '#102A43' }}
      >
        <div className="sticker-player__top">
          <div className="sticker-player__meta">
            <span className="sticker-player__title-text">{data.title || 'Throw Some D\'s'}</span>
            <span className="sticker-player__artist-text">{data.artist || 'Rich Boy, Polow Da Don'}</span>
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
            onClick={() => setIsPlaying(p => !p)}
            title={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button className="sticker-player__btn" title="Próxima"><SkipForward size={12} /></button>
        </div>
      </div>
    );
  }

  if (data.stickerType === 'prompt') {
    return (
      <div
        className="block-sticker block-sticker--prompt"
        style={{ background: data.bg || '#E7F0F8', color: data.textColor || '#2C4960' }}
      >
        <div className="sticker-prompt__title">
          <input
            className="sticker-prompt__title-input"
            value={data.prompt || ''}
            onChange={e => onChange({ ...data, prompt: e.target.value })}
            placeholder="PROMPT DO DIA:"
          />
        </div>
        <div className="sticker-prompt__body">
          <input
            className="sticker-prompt__text-input"
            value={data.text || ''}
            onChange={e => onChange({ ...data, text: e.target.value })}
            placeholder="minha resposta aqui..."
          />
        </div>
      </div>
    );
  }

  if (data.stickerType === 'badge') {
    return (
      <div
        className="block-sticker block-sticker--badge"
        style={{ background: data.bg || '#334E68', color: data.textColor || '#FFFFFF' }}
      >
        <input
          className="sticker-badge__input"
          value={data.text || ''}
          onChange={e => onChange({ ...data, text: e.target.value })}
          placeholder="I GOT THIS."
        />
      </div>
    );
  }

  // Quote / sticky reminder
  return (
    <div
      className="block-sticker block-sticker--quote"
      style={{ background: data.bg || '#FFF8E7', color: data.textColor || '#574116' }}
    >
      <div className="sticker-quote__author">
        <input
          className="sticker-quote__author-input"
          value={data.author || ''}
          onChange={e => onChange({ ...data, author: e.target.value })}
          placeholder="✦ Autor ou tag"
        />
      </div>
      <textarea
        className="sticker-quote__text-input"
        value={data.text || ''}
        onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Frase inspiradora ou lembrete..."
        rows={2}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* BLOCK RENDERER (dispatch by type)                   */
/* -------------------------------------------------- */
export function BlockRenderer({ block, onChange }) {
  const props = { data: block, onChange };
  switch (block.type) {
    case 'heading':   return <HeadingBlock   {...props} />;
    case 'paragraph': return <ParagraphBlock {...props} />;
    case 'note':      return <NoteBlock      {...props} />;
    case 'divider':   return <DividerBlock   {...props} />;
    case 'image':     return <ImageBlock     {...props} />;
    case 'checklist': return <ChecklistBlock {...props} />;
    case 'code':      return <CodeBlock      {...props} />;
    case 'minical':   return <MiniCalBlock   {...props} />;
    case 'habits':    return <HabitsContent />;
    case 'mood':      return <MoodContent    {...props} />;
    case 'links':     return <LinksContent />;
    case 'shelves':   return <ShelvesContent />;
    case 'sticker':   return <StickerBlock   {...props} />;
    default:          return null;
  }
}
