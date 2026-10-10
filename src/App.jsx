import { useState, useCallback, useEffect, useRef } from 'react';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import { BentoCard } from './components/BentoGrid/BentoGrid';
import ModulePicker, { FAB } from './components/ModulePicker/ModulePicker';
import { BlockRenderer, BlockMenu } from './components/Blocks/Blocks';
import FloatingPanel from './components/FloatingPanel/FloatingPanel';
import StickersPanel from './components/FloatingPanel/StickersPanel';
import FreeSticker from './components/FreeStickers/FreeSticker';
import MiniCalendarContent from './components/Blocks/MiniCalendarContent';
import HabitsContent from './components/Blocks/HabitsContent';
import LinksContent from './components/Blocks/LinksContent';
import ShelvesContent from './components/Blocks/ShelvesContent';
import SearchModal from './components/SearchModal/SearchModal';
import AddItemModal from './components/AddItemModal/AddItemModal';
import {
  formatDateKey, saveDayEntry, loadDayEntry,
  saveTheme, loadTheme, exportPlannerData, importPlannerData,
  savePalette, loadPalette, getSavedDatesIndex
} from './services/storage';
import {
  CheckCircle2, Flame, BookOpen, Film,
  CalendarDays, Link2, TrendingUp, Sparkles,
  BookMarked, ArrowUpRight, GripVertical,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import './components/Layout/Layout.css';
import './components/FloatingPanel/FloatingPanel.css';
import './App.css';

/* -------------------------------------------------- */
/* DEFAULT DEMO CONTENT (carregado se dia estiver vazio)*/
/* -------------------------------------------------- */
const DEFAULT_DEMO_BLOCKS = [
  {
    id: 'demo-heading-1',
    type: 'heading',
    colSpan: 3,
    text: 'Reflexões e Metas de Hoje',
  },
  {
    id: 'demo-check-1',
    type: 'checklist',
    colSpan: 2,
    title: 'Lista de Prioridades',
    items: [
      { id: 101, text: 'Definir metas da semana', done: true },
      { id: 102, text: 'Caminhada ao ar livre', done: false },
      { id: 103, text: 'Revisar anotações do diário', done: false },
    ],
  },
  {
    id: 'demo-note-1',
    type: 'note',
    colSpan: 1,
    text: 'Pequenos passos diários constroem grandes transformações.',
  },
];

const DEFAULT_DEMO_STICKERS = [
  {
    id: 'stk-1',
    stickerType: 'prompt',
    x: 390,
    y: 90,
    width: 320,
    prompt: 'HOJE VOU DEDICAR 30 MIN A:',
    text: 'meu planejamento financeiro',
    bg: '#E7F0F8',
    textColor: '#2C4960',
    rotation: -1.5,
    zIndex: 20,
  },
  {
    id: 'stk-2',
    stickerType: 'badge',
    x: 30,
    y: 195,
    width: 175,
    text: 'I GOT THIS. 💪',
    bg: '#334E68',
    textColor: '#FFFFFF',
    rotation: 2,
    zIndex: 21,
  },
  {
    id: 'stk-3',
    stickerType: 'quote',
    x: 400,
    y: 250,
    width: 300,
    author: '@lembrete',
    text: 'Você está no caminho certo. Respire fundo e continue.',
    bg: '#FFF8E7',
    textColor: '#574116',
    rotation: 1,
    zIndex: 22,
  },
  {
    id: 'stk-4',
    stickerType: 'player',
    x: 30,
    y: 275,
    width: 240,
    title: 'Good Vibrations',
    artist: 'Beach Boys',
    bg: '#D9E2EC',
    textColor: '#102A43',
    rotation: -0.5,
    zIndex: 23,
  },
];

/* -------------------------------------------------- */
/* DYNAMIC CARD (Fase 2 + Draggable + M3 Menu)         */
/* -------------------------------------------------- */
function DynamicCard({
  block,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onUpdate,
  onDelete,
  onResize,
  currentDate,
  onSelectDate,
  savedDates,
}) {
  return (
    <BentoCard
      id={`dyn-card-${block.id}`}
      colSpan={block.colSpan}
      variant={block.type === 'note' ? 'warm' : block.type === 'divider' ? 'transparent' : 'solid'}
      showActions={false}
      className={`${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''} entering`}
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <div className="block-card-header">
        <div className="block-drag-handle" title="Arrastar para reorganizar">
          <GripVertical size={13} />
        </div>
        <BlockMenu
          colSpan={block.colSpan}
          onResize={cols => onResize(block.id, cols)}
          onDelete={() => onDelete(block.id)}
        />
      </div>

      <BlockRenderer
        block={block}
        onChange={updated => onUpdate(block.id, updated)}
        currentDate={currentDate}
        onSelectDate={onSelectDate}
        savedDates={savedDates}
      />
    </BentoCard>
  );
}

/* -------------------------------------------------- */
/* APP ROOT                                            */
/* -------------------------------------------------- */
export default function App() {
  const [theme, setTheme]         = useState(() => loadTheme());
  const [palette, setPalette]     = useState(() => loadPalette());
  const [activeNav, setActiveNav] = useState('home');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedDates, setSavedDates] = useState(() => getSavedDatesIndex());

  // Global shelves state (shared between panel and inline AddItemModal)
  const INITIAL_BOOKS = [
    { id: 1, title: 'O Hobbit', author: 'J.R.R. Tolkien', progress: 64, status: 'cap. 14 de 19', cover: null },
    { id: 2, title: 'Hábitos Atômicos', author: 'James Clear', progress: 30, status: 'cap. 4 de 15', cover: null },
  ];
  const INITIAL_MOVIES = [
    { id: 101, title: 'Duna: Parte 2', director: 'Denis Villeneuve', rating: 5, cover: null },
    { id: 102, title: 'Interstellar', director: 'Christopher Nolan', rating: 5, cover: null },
  ];
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemType, setAddItemType] = useState('book'); // 'book' | 'film'
  const [shelvesDefaultTab, setShelvesDefaultTab] = useState('books');

  const openAddItem = (type) => {
    setAddItemType(type);
    setAddItemOpen(true);
  };

  const handleAddItemConfirm = (type, item) => {
    if (type === 'book') setBooks(prev => [...prev, item]);
    else setMovies(prev => [...prev, item]);
  };


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    document.documentElement.setAttribute('data-palette', palette);
  }, [theme, palette]);

  const handleChangePalette = (newPalette) => {
    setPalette(newPalette);
    savePalette(newPalette);
  };

  // Global Keyboard Shortcuts (Ctrl+K or / to search)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) &&
        !document.activeElement?.isContentEditable
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Floating panels state
  const [panels, setPanels] = useState({
    habits: false,
    calendar: false,
    links: false,
    shelves: false,
    stickers: false,
  });

  const togglePanel = (name) =>
    setPanels(p => ({ ...p, [name]: !p[name] }));

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateKey = formatDateKey(currentDate);
  const isToday = dateKey === formatDateKey(new Date());

  const goToPrevDay = () => setCurrentDate(prev => new Date(prev.getTime() - 86400000));
  const goToNextDay = () => setCurrentDate(prev => new Date(prev.getTime() + 86400000));
  const goToToday   = () => setCurrentDate(new Date());

  const handleSelectDate = useCallback((target) => {
    if (typeof target === 'string') {
      const [y, m, d] = target.split('-').map(Number);
      setCurrentDate(new Date(y, m - 1, d));
    } else if (target instanceof Date) {
      setCurrentDate(target);
    }
  }, []);

  // Data State for Current Day
  const [blocks, setBlocks] = useState(() => {
    const saved = loadDayEntry(formatDateKey(new Date()));
    return saved ? saved.blocks : DEFAULT_DEMO_BLOCKS;
  });

  const [stickers, setStickers] = useState(() => {
    const saved = loadDayEntry(formatDateKey(new Date()));
    return saved ? saved.stickers : DEFAULT_DEMO_STICKERS;
  });

  // Auto-Save Status
  const [saveStatus, setSaveStatus] = useState('saved');
  const isFirstLoad = useRef(true);

  // Load entry when dateKey changes
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const saved = loadDayEntry(dateKey);
    if (saved) {
      setBlocks(saved.blocks || []);
      setStickers(saved.stickers || []);
    } else {
      if (isToday) {
        setBlocks(DEFAULT_DEMO_BLOCKS);
        setStickers(DEFAULT_DEMO_STICKERS);
      } else {
        setBlocks([]);
        setStickers([]);
      }
    }
  }, [dateKey]);

  // Auto-save to LocalStorage on change
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveDayEntry(dateKey, { blocks, stickers });
      setSavedDates(getSavedDatesIndex());
      setSaveStatus('saved');
    }, 300);
    return () => clearTimeout(timer);
  }, [blocks, stickers, dateKey]);

  // Drag and Drop state for blocks
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    saveTheme(next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
  };

  // Block management
  const handleAddBlock = useCallback((type) => {
    const defaults = {
      heading:   { text: '' },
      paragraph: { text: '' },
      note:      { text: '' },
      divider:   {},
      image:     { src: null, caption: '' },
      checklist: { title: 'Nova Checklist', items: [{ id: Date.now(), text: '', done: false }] },
      code:      { code: '' },
      minical:   {},
      habits:    {},
      mood:      { mood: '😊 Ótimo', note: 'Como me sinto hoje...' },
      links:     {},
      shelves:   {},
    };
    const defaultColSpans = {
      heading: 3,
      divider: 3,
      minical: 1,
      mood: 1,
      links: 1,
      habits: 2,
      shelves: 2,
      checklist: 2,
      paragraph: 2,
      note: 1,
      image: 2,
      code: 2,
    };
    setBlocks(prev => [...prev, {
      id: `block-${Date.now()}`,
      type,
      colSpan: defaultColSpans[type] || 2,
      ...(defaults[type] || {}),
    }]);
  }, []);

  const handleUpdateBlock = useCallback((id, updated) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b)), []);

  const handleDeleteBlock = useCallback((id) =>
    setBlocks(prev => prev.filter(b => b.id !== id)), []);

  const handleResizeBlock = useCallback((id, cols) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, colSpan: cols } : b)), []);

  // Free Sticker management
  const handleUpdateSticker = useCallback((id, patch) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const handleDeleteSticker = useCallback((id) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleBringToFront = useCallback((id) => {
    setStickers(prev => {
      const maxZ = prev.reduce((max, s) => Math.max(max, s.zIndex || 10), 10);
      return prev.map(s => s.id === id ? { ...s, zIndex: maxZ + 1 } : s);
    });
  }, []);

  const handleAddSticker = useCallback((template) => {
    setStickers(prev => {
      const maxZ = prev.reduce((max, s) => Math.max(max, s.zIndex || 10), 10);
      const newSticker = {
        id: `stk-${Date.now()}`,
        ...template,
        x: Math.round(60 + Math.random() * 220),
        y: Math.round(100 + Math.random() * 180),
        width: template.category === 'prompts' ? 300 : template.category === 'badges' ? 180 : 260,
        rotation: Number((Math.random() * 4 - 2).toFixed(1)),
        zIndex: maxZ + 1,
      };
      return [...prev, newSticker];
    });
  }, []);

  // Backup handlers
  const handleExportBackup = () => {
    const success = exportPlannerData();
    if (success) {
      alert('Backup exportado com sucesso! Arquivo JSON baixado.');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importPlannerData(event.target.result);
      if (result.success) {
        alert(`Backup restaurado com sucesso! ${result.count} dia(s) importados.`);
        setSavedDates(getSavedDatesIndex());
        const saved = loadDayEntry(dateKey);
        if (saved) {
          setBlocks(saved.blocks || []);
          setStickers(saved.stickers || []);
        }
      } else {
        alert(`Erro ao restaurar backup: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  // Sidebar navigation action handler
  const handleSidebarNavigate = (id) => {
    setActiveNav(id);
    if (id === 'home') {
      goToToday();
    } else if (id === 'calendar') {
      togglePanel('calendar');
    } else if (id === 'pages') {
      setSearchOpen(true);
    } else if (id === 'bento') {
      const el = document.querySelector('.diary-bento');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else setPickerOpen(true);
    } else if (id === 'habits') {
      togglePanel('habits');
    } else if (id === 'books' || id === 'films') {
      setPanels(p => ({ ...p, shelves: true }));
    } else if (id === 'stickers') {
      setPanels(p => ({ ...p, stickers: true }));
    }
  };

  // Date formatted strings
  const weekday = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayNum  = currentDate.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month   = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
  const year    = currentDate.getFullYear();

  return (
    <div
      className="layout"
      data-theme={theme === 'dark' ? 'dark' : ''}
      data-palette={palette}
    >
      <TopBar
        theme={theme}
        onToggleTheme={toggleTheme}
        palette={palette}
        onChangePalette={handleChangePalette}
        onOpenSearch={() => setSearchOpen(true)}
        panels={panels}
        onTogglePanel={togglePanel}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <div className="layout__body">
        <Sidebar
          activeItem={activeNav}
          onNavigate={handleSidebarNavigate}
          savedCount={savedDates.length}
        />

        <main className="layout__main" id="main-content">
          <div className="diary-wrap">
            <div className="diary-page">

              {/* === PLANNER BANNER (Inspirado na referência) === */}
              <div className="diary-banner">
                <span className="diary-banner__title">ESPAÇO DE POSSIBILIDADES INFINITAS ✦</span>
              </div>

              {/* === DIARY HEADER COM NAVEGAÇÃO DE DIAS E AUTO-SAVE === */}
              <div className="diary-header">
                <div className="diary-header__top-row">
                  <div className="diary-header__eyebrow">
                    Página do dia
                    {isToday && <span className="diary-header__today-badge">Hoje</span>}
                  </div>

                  {/* Auto-save Status */}
                  <div className="diary-header__save-status">
                    <span className="diary-save-dot" />
                    <span>{saveStatus === 'saving' ? 'Salvando...' : 'Salvo no navegador'}</span>
                  </div>
                </div>

                <div className="diary-header__date">
                  {weekday.charAt(0).toUpperCase() + weekday.slice(1)},{' '}
                  <em>{dayNum} de {month}</em>{' '}de {year}
                </div>

                <div className="diary-header__meta">
                  <span className="diary-header__mood-tag">😊 Ótimo</span>
                  <span className="diary-header__dot" />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-4)' }}>
                    {blocks.length} bloco{blocks.length !== 1 ? 's' : ''} · {stickers.length} adesivo{stickers.length !== 1 ? 's' : ''}
                  </span>
                  <span className="diary-header__dot" />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 500 }}>
                    Entradas salvas automaticamente no LocalStorage 💾
                  </span>
                </div>
              </div>

              {/* === ETIQUETAS LATERAIS DE NAVEGAÇÃO (LADO DIREITO) === */}
              <div className="diary-page-tabs" aria-label="Navegação entre dias">
                <button
                  className="diary-page-tab"
                  onClick={goToPrevDay}
                  title="Dia anterior"
                  id="tab-prev-day"
                >
                  <ChevronLeft size={16} />
                  <span className="diary-page-tab__label">ANTERIOR</span>
                </button>

                <button
                  className="diary-page-tab"
                  onClick={goToNextDay}
                  title="Próximo dia"
                  id="tab-next-day"
                >
                  <ChevronRight size={16} />
                  <span className="diary-page-tab__label">PRÓXIMO</span>
                </button>

                {!isToday && (
                  <button
                    className="diary-page-tab diary-page-tab--today"
                    onClick={goToToday}
                    title="Voltar para a página de hoje"
                    id="tab-today"
                  >
                    <span className="diary-page-tab__label">HOJE</span>
                  </button>
                )}
              </div>

              {/* === FREE FLOATING STICKERS LAYER === */}
              {stickers.map(stk => (
                <FreeSticker
                  key={stk.id}
                  sticker={stk}
                  onUpdate={handleUpdateSticker}
                  onDelete={handleDeleteSticker}
                  onBringToFront={handleBringToFront}
                />
              ))}

              {/* === DIARY CONTENT (bento grid) === */}
              {blocks.length === 0 ? (
                <div className="diary-empty">
                  <div className="diary-empty__icon">✦</div>
                  <div className="diary-empty__text">Esta página está em branco.</div>
                  <div className="diary-empty__sub">Clique no botão + abaixo para começar a planejar seu dia.</div>
                </div>
              ) : (
                <div className="diary-bento">
                  {blocks.map((block, index) => (
                    <DynamicCard
                      key={block.id}
                      block={block}
                      index={index}
                      isDragging={draggedIndex === index}
                      isDragOver={dragOverIndex === index}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      onUpdate={handleUpdateBlock}
                      onDelete={handleDeleteBlock}
                      onResize={handleResizeBlock}
                      currentDate={currentDate}
                      onSelectDate={handleSelectDate}
                      savedDates={savedDates}
                    />
                  ))}
                </div>
              )}

              {/* === PLANNER BOTTOM TABS === */}
              <div className="diary-bottom-tabs">
                <button
                  className="diary-bottom-tab active"
                  onClick={() => togglePanel('stickers')}
                  title="Abrir cartela de adesivos"
                >
                  ✨ Cartela de Adesivos
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ====== FLOATING PANELS ====== */}
      {panels.habits && (
        <FloatingPanel
          title="Hábitos do dia"
          icon={Flame}
          onClose={() => togglePanel('habits')}
          initialPos={{ top: 80, right: 24 }}
        >
          <HabitsContent />
        </FloatingPanel>
      )}

      {panels.calendar && (
        <FloatingPanel
          title="Calendário"
          icon={CalendarDays}
          onClose={() => togglePanel('calendar')}
          initialPos={{ top: 80, right: 360 }}
        >
          <MiniCalendarContent
            currentDate={currentDate}
            onSelectDate={handleSelectDate}
            savedDates={savedDates}
          />
        </FloatingPanel>
      )}

      {panels.links && (
        <FloatingPanel
          title="Links rápidos"
          icon={Link2}
          onClose={() => togglePanel('links')}
          initialPos={{ top: 80, right: 24 }}
        >
          <LinksContent />
        </FloatingPanel>
      )}

      {panels.shelves && (
        <FloatingPanel
          title="Prateleiras (Livros & Filmes)"
          icon={BookMarked}
          onClose={() => togglePanel('shelves')}
          initialPos={{ top: 80, right: 24 }}
        >
          <ShelvesContent />
        </FloatingPanel>
      )}

      {panels.stickers && (
        <FloatingPanel
          title="Cartela de Adesivos"
          icon={Sparkles}
          onClose={() => togglePanel('stickers')}
          initialPos={{ top: 80, right: 24 }}
        >
          <StickersPanel onAddSticker={handleAddSticker} />
        </FloatingPanel>
      )}

      {/* ====== SEARCH / COMMAND PALETTE MODAL ====== */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectDate={handleSelectDate}
        savedDates={savedDates}
        currentDateKey={dateKey}
      />

      {/* ====== FAB + MODULE PICKER ====== */}
      <ModulePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddBlock}
        onOpenStickers={() => setPanels(p => ({ ...p, stickers: true }))}
      />
      <FAB open={pickerOpen} onClick={() => setPickerOpen(p => !p)} />
    </div>
  );
}
