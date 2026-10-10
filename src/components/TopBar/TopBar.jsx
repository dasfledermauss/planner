import { useState } from 'react';
import {
  BookMarked, Plus, Bell, Search, Sun, Moon,
  Flame, CalendarDays, Link2, BookOpen
} from 'lucide-react';
import './TopBar.css';

const MOODS = [
  { emoji: '😊', label: 'Ótimo' },
  { emoji: '😐', label: 'Ok' },
  { emoji: '😔', label: 'Difícil' },
  { emoji: '🌟', label: 'Inspirado' },
  { emoji: '😴', label: 'Cansado' },
  { emoji: '🔥', label: 'Produtivo' },
];

export default function TopBar({ theme, onToggleTheme, panels = {}, onTogglePanel }) {
  const [mood, setMood] = useState(MOODS[0]);
  const [moodIndex, setMoodIndex] = useState(0);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short'
  });

  const cycleMood = () => {
    const next = (moodIndex + 1) % MOODS.length;
    setMoodIndex(next);
    setMood(MOODS[next]);
  };

  const PANEL_BTNS = [
    { key: 'habits',   icon: Flame,       label: 'Hábitos'    },
    { key: 'calendar', icon: CalendarDays, label: 'Calendário' },
    { key: 'links',    icon: Link2,        label: 'Links'      },
    { key: 'shelves',  icon: BookOpen,     label: 'Prateleiras'},
  ];

  return (
    <header className="topbar" id="topbar">
      {/* LEFT */}
      <div className="topbar__left">
        <div className="topbar__brand">
          <div className="topbar__brand-icon">
            <BookMarked size={14} />
          </div>
          <span className="topbar__brand-name">planner</span>
        </div>

        <div className="topbar__divider" />

        <div className="topbar__profile" id="topbar-profile">
          <div className="topbar__avatar">
            <span className="topbar__avatar-placeholder">J</span>
          </div>
          <div className="topbar__profile-info">
            <span className="topbar__profile-name">Jackson</span>
            <span className="topbar__profile-sub">em movimento ✦</span>
          </div>
        </div>

        <button
          className="topbar__mood"
          id="topbar-mood"
          onClick={cycleMood}
          title="Humor do dia"
        >
          <span className="topbar__mood-emoji">{mood.emoji}</span>
          {mood.label}
        </button>
      </div>

      {/* CENTER: Panel toggle buttons */}
      <div className="topbar__center">
        <div className="topbar__links">
          {PANEL_BTNS.map(btn => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.key}
                className={`topbar__link-chip${panels[btn.key] ? ' active' : ''}`}
                id={`panel-btn-${btn.key}`}
                onClick={() => onTogglePanel(btn.key)}
                title={btn.label}
              >
                <Icon size={12} />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div className="topbar__right">
        <span className="topbar__date">{today}</span>

        <button className="topbar__icon-btn" id="topbar-search" title="Buscar">
          <Search size={16} />
        </button>
        <button className="topbar__icon-btn" id="topbar-notifications" title="Notificações">
          <Bell size={16} />
        </button>
        <button
          className={`topbar__icon-btn${theme === 'dark' ? ' active' : ''}`}
          id="topbar-theme-toggle"
          onClick={onToggleTheme}
          title="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
