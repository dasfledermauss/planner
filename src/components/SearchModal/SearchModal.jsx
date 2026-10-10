import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, X, Calendar, CheckSquare, FileText,
  Sparkles, BookOpen, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { searchPlannerEntries, loadDayEntry } from '../../services/storage';
import './SearchModal.css';

export default function SearchModal({
  open,
  onClose,
  onSelectDate,
  savedDates = [],
  currentDateKey,
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus on mount or when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Execute search
  const rawResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchPlannerEntries(query);
  }, [query]);

  // Filter results by category
  const results = useMemo(() => {
    if (!query.trim()) return [];
    if (category === 'all') return rawResults;

    return rawResults.map(res => {
      const filteredMatches = res.matches.filter(m => {
        if (category === 'tasks') return m.type === 'task' || m.type === 'checklist';
        if (category === 'notes') return m.type === 'heading' || m.type === 'note' || m.type === 'paragraph' || m.type === 'mood-note';
        if (category === 'stickers') return m.type === 'sticker';
        if (category === 'dates') return m.type === 'date';
        return true;
      });
      return { ...res, matches: filteredMatches };
    }).filter(res => res.matches.length > 0);
  }, [rawResults, category, query]);

  // Saved dates previews for empty query view
  const recentSavedPages = useMemo(() => {
    if (query.trim()) return [];
    const list = [...savedDates].reverse().slice(0, 8);
    return list.map(dateKey => {
      const [y, m, d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const entry = loadDayEntry(dateKey);
      const blockCount = entry?.blocks?.length || 0;
      const stickerCount = entry?.stickers?.length || 0;
      const label = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      });
      return {
        dateKey,
        label,
        blockCount,
        stickerCount,
      };
    });
  }, [savedDates, query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const activeListLength = query.trim() ? results.length : recentSavedPages.length;
      if (activeListLength === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % activeListLength);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + activeListLength) % activeListLength);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (query.trim() && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex].dateKey);
        } else if (!query.trim() && recentSavedPages[highlightedIndex]) {
          handleSelect(recentSavedPages[highlightedIndex].dateKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, query, results, recentSavedPages, highlightedIndex, onClose]);

  const handleSelect = (dateKey) => {
    if (onSelectDate) onSelectDate(dateKey);
    onClose();
  };

  const highlightMatch = (text, term) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  if (!open) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        
        {/* Header */}
        <div className="search-modal__header">
          <div className="search-modal__icon">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            className="search-modal__input"
            placeholder="Buscar em anotações, tarefas, adesivos ou datas..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            }}
          />
          {query && (
            <button
              className="search-modal__clear"
              onClick={() => setQuery('')}
              title="Limpar busca"
            >
              <X size={15} />
            </button>
          )}
          <span className="search-modal__badge">ESC</span>
        </div>

        {/* Filter Categories (shown when searching) */}
        {query.trim().length > 0 && (
          <div className="search-modal__filters">
            {[
              { id: 'all', label: 'Tudo' },
              { id: 'tasks', label: 'Tarefas' },
              { id: 'notes', label: 'Anotações' },
              { id: 'stickers', label: 'Adesivos' },
              { id: 'dates', label: 'Datas' },
            ].map(f => (
              <button
                key={f.id}
                className={`search-filter-chip${category === f.id ? ' active' : ''}`}
                onClick={() => setCategory(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="search-modal__body">
          {query.trim().length > 0 ? (
            results.length === 0 ? (
              <div className="search-empty">
                <div className="search-empty__icon">🔍</div>
                <div className="search-empty__title">Nenhum resultado encontrado</div>
                <div className="search-empty__desc">
                  Não encontramos nada correspondente a "{query}". Tente buscar por palavras-chave de tarefas, títulos de notas ou meses.
                </div>
              </div>
            ) : (
              <>
                <div className="search-group-title">
                  {results.length} dia{results.length > 1 ? 's' : ''} com correspondências
                </div>
                {results.map((item, idx) => (
                  <button
                    key={item.dateKey}
                    className={`search-result-item${highlightedIndex === idx ? ' highlighted' : ''}${item.dateKey === currentDateKey ? ' active-day' : ''}`}
                    onClick={() => handleSelect(item.dateKey)}
                  >
                    <div className="search-result-item__header">
                      <span className="search-result-item__date">
                        <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                        {item.displayDate}
                      </span>
                      <span className="search-result-item__badge">
                        {item.matches.length} match{item.matches.length > 1 ? 'es' : ''}
                      </span>
                    </div>

                    <div className="search-result-item__snippets">
                      {item.matches.slice(0, 3).map((m, sIdx) => (
                        <div key={sIdx} className="search-snippet">
                          <span className="search-snippet__type">{m.label}</span>
                          <span className="search-snippet__text">
                            {highlightMatch(m.snippet, query)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </>
            )
          ) : (
            <>
              <div className="search-group-title">
                Páginas Salvas Recentemente ({recentSavedPages.length})
              </div>

              {recentSavedPages.length === 0 ? (
                <div className="search-empty">
                  <div className="search-empty__icon">✦</div>
                  <div className="search-empty__title">Nenhuma página salva ainda</div>
                  <div className="search-empty__desc">
                    Conforme você adiciona blocos e adesivos, eles serão indexados para busca rápida aqui.
                  </div>
                </div>
              ) : (
                recentSavedPages.map((page, idx) => (
                  <button
                    key={page.dateKey}
                    className={`search-result-item${highlightedIndex === idx ? ' highlighted' : ''}${page.dateKey === currentDateKey ? ' active-day' : ''}`}
                    onClick={() => handleSelect(page.dateKey)}
                  >
                    <div className="search-result-item__header">
                      <span className="search-result-item__date">
                        <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                        {page.label}
                        {page.dateKey === currentDateKey && (
                          <span style={{ fontSize: 10, color: 'var(--color-primary)', fontWeight: 'bold' }}>
                            (Página Atual)
                          </span>
                        )}
                      </span>
                      <ArrowRight size={13} style={{ color: 'var(--color-text-3)' }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', paddingLeft: 22 }}>
                      {page.blockCount} bloco{page.blockCount !== 1 ? 's' : ''} · {page.stickerCount} adesivo{page.stickerCount !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="search-modal__footer">
          <div className="search-modal__footer-hints">
            <span className="search-modal__hint">
              <kbd>↑</kbd> <kbd>↓</kbd> navegar
            </span>
            <span className="search-modal__hint">
              <kbd><CornerDownLeft size={10} /></kbd> selecionar
            </span>
            <span className="search-modal__hint">
              <kbd>ESC</kbd> fechar
            </span>
          </div>
          <span>Atalho: <strong>Ctrl + K</strong></span>
        </div>

      </div>
    </div>
  );
}
