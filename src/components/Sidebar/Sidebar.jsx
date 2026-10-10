import { useState } from 'react';
import {
  CalendarDays, FileText, LayoutGrid, BookOpen,
  Film, CheckSquare, Sticker, ChevronRight, Home, Layers
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'home',     icon: Home,         label: 'Início',       badge: null },
  { id: 'calendar', icon: CalendarDays,  label: 'Calendário',   badge: null },
  { id: 'pages',    icon: FileText,      label: 'Páginas',      badge: 3    },
  { id: 'bento',    icon: LayoutGrid,    label: 'Bento',        badge: null },
];

const SECONDARY_ITEMS = [
  { id: 'habits',   icon: CheckSquare,   label: 'Hábitos',      badge: null },
  { id: 'books',    icon: BookOpen,      label: 'Livros',       badge: null },
  { id: 'films',    icon: Film,          label: 'Filmes',       badge: null },
  { id: 'stickers', icon: Sticker,       label: 'Stickers',     badge: null },
];

export default function Sidebar({ activeItem, onNavigate, savedCount = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const navItems = NAV_ITEMS.map(item =>
    item.id === 'pages' ? { ...item, badge: savedCount || null } : item
  );

  return (
    <nav
      className={`sidebar${expanded ? ' expanded' : ''}`}
      id="sidebar"
      aria-label="Menu lateral"
    >
      <div className="sidebar__nav">
        {navItems.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeItem === item.id}
            expanded={expanded}
            onClick={() => onNavigate(item.id)}
          />
        ))}

        <div className="sidebar__sep" />

        {SECONDARY_ITEMS.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeItem === item.id}
            expanded={expanded}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>

      <button
        className="sidebar__toggle"
        id="sidebar-toggle"
        onClick={() => setExpanded(e => !e)}
        title={expanded ? 'Recolher menu' : 'Expandir menu'}
        aria-expanded={expanded}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function SidebarItem({ item, active, expanded, onClick }) {
  const Icon = item.icon;
  return (
    <button
      className={`sidebar__item${active ? ' active' : ''}`}
      id={`sidebar-${item.id}`}
      onClick={onClick}
      title={item.label}
    >
      <span className="sidebar__item-icon">
        <Icon size={16} />
      </span>
      <span className="sidebar__item-label">{item.label}</span>
      {item.badge && (
        <span className="sidebar__badge">{item.badge}</span>
      )}
      {!expanded && (
        <span className="sidebar__item-tooltip">{item.label}</span>
      )}
    </button>
  );
}
