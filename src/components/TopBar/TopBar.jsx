import { useState } from 'react';
import {
  BookMarked, Bell, Search, Sun, Moon,
  Link2, Download, Upload
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

const PALETTES = [
  { id: 'warm',   label: 'Papiro Clássico', icon: '🌾' },
  { id: 'sage',   label: 'Sálvia Botânica', icon: '🌿' },
  { id: 'blush',  label: 'Rosé & Aconchego', icon: '🌸' },
  { id: 'indigo', label: 'Índigo Noturno',   icon: '🌌' },
];

export default function TopBar({
  theme,
  onToggleTheme,
  palette = 'warm',
  onChangePalette,
  onOpenSearch,
  panels = {},
  onTogglePanel,
  onExportBackup,
  onImportBackup,
}) {
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

  const cyclePalette = () => {
    if (!onChangePalette) return;
    const currentIdx = PALETTES.findIndex(p => p.id === palette);
    const nextIdx = (currentIdx + 1) % PALETTES.length;
    onChangePalette(PALETTES[nextIdx].id);
  };

  const currentPaletteObj = PALETTES.find(p => p.id === palette) || PALETTES[0];

  const PANEL_BTNS = [
    { key: 'links', icon: Link2, label: 'Links Rápidos' },
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

        {/* Paper Palette Switcher */}
        <button
          className="topbar__icon-btn"
          id="topbar-palette-btn"
          onClick={cyclePalette}
          title={`Paleta do Papel: ${currentPaletteObj.label} (clique para alternar)`}
        >
          <span style={{ fontSize: 13 }}>{currentPaletteObj.icon}</span>
        </button>

        <button
          className="topbar__icon-btn"
          id="topbar-export"
          onClick={onExportBackup}
          title="Fazer Backup / Exportar Diário (JSON)"
        >
          <Download size={15} />
        </button>

        <label
          className="topbar__icon-btn"
          id="topbar-import"
          title="Restaurar Backup (JSON)"
          style={{ cursor: 'pointer' }}
        >
          <Upload size={15} />
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onImportBackup}
          />
        </label>

        <button
          className="topbar__icon-btn"
          id="topbar-search"
          onClick={onOpenSearch}
          title="Buscar no Planner (Ctrl + K)"
        >
          <Search size={16} />
        </button>
        <button className="topbar__icon-btn" id="topbar-notifications" title="Notificações">
          <Bell size={16} />
        </button>
        <button
          className={`topbar__icon-btn${theme === 'dark' ? ' active' : ''}`}
          id="topbar-theme-toggle"
          onClick={onToggleTheme}
          title="Alternar tema claro/escuro"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
