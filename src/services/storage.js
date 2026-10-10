// ============================================
// STORAGE SERVICE (LocalStorage + Backup / Export)
// ============================================

const STORAGE_PREFIX = 'planner_entry_';
const THEME_KEY = 'planner_theme';
const INDEX_KEY = 'planner_saved_dates';

export const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getSavedDatesIndex = () => {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading saved dates index:', err);
    return [];
  }
};

const updateDatesIndex = (dateKey) => {
  try {
    const dates = getSavedDatesIndex();
    if (!dates.includes(dateKey)) {
      dates.push(dateKey);
      dates.sort();
      localStorage.setItem(INDEX_KEY, JSON.stringify(dates));
    }
  } catch (err) {
    console.error('Error updating dates index:', err);
  }
};

export const saveDayEntry = (dateKey, { blocks, stickers }) => {
  try {
    const data = {
      dateKey,
      updatedAt: new Date().toISOString(),
      blocks: blocks || [],
      stickers: stickers || [],
    };
    localStorage.setItem(`${STORAGE_PREFIX}${dateKey}`, JSON.stringify(data));
    updateDatesIndex(dateKey);
    return true;
  } catch (err) {
    console.error('Error saving day entry:', err);
    return false;
  }
};

export const loadDayEntry = (dateKey) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading day entry:', err);
    return null;
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Error saving theme:', err);
  }
};

export const loadTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch (err) {
    return 'light';
  }
};

const PALETTE_KEY = 'planner_palette';
export const savePalette = (palette) => {
  try {
    localStorage.setItem(PALETTE_KEY, palette);
  } catch (err) {
    console.error('Error saving palette:', err);
  }
};

export const loadPalette = () => {
  try {
    return localStorage.getItem(PALETTE_KEY) || 'warm';
  } catch (err) {
    return 'warm';
  }
};

// Global Search across all planner entries
export const searchPlannerEntries = (query) => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const dates = getSavedDatesIndex();
  const results = [];

  dates.forEach(dateKey => {
    const entry = loadDayEntry(dateKey);
    if (!entry) return;

    const matches = [];

    // Parse date for search match (e.g. 'outubro', '2026', 'quarta')
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateLabel = dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

    if (dateLabel.toLowerCase().includes(q) || dateKey.includes(q)) {
      matches.push({
        type: 'date',
        label: 'Data',
        snippet: dateLabel,
      });
    }

    // Search blocks
    (entry.blocks || []).forEach(b => {
      if (b.text && b.text.toLowerCase().includes(q)) {
        matches.push({
          type: b.type || 'bloco',
          label: b.type === 'heading' ? 'Título' : b.type === 'note' ? 'Nota' : 'Texto',
          snippet: b.text,
        });
      }
      if (b.title && b.title.toLowerCase().includes(q)) {
        matches.push({
          type: 'checklist',
          label: 'Checklist',
          snippet: b.title,
        });
      }
      if (b.items && Array.isArray(b.items)) {
        b.items.forEach(it => {
          if (it.text && it.text.toLowerCase().includes(q)) {
            matches.push({
              type: 'task',
              label: 'Item de Tarefa',
              snippet: `${it.done ? '✓' : '○'} ${it.text}`,
            });
          }
        });
      }
      if (b.mood && b.mood.toLowerCase().includes(q)) {
        matches.push({
          type: 'mood',
          label: 'Humor',
          snippet: `${b.mood} ${b.note ? '— ' + b.note : ''}`,
        });
      }
      if (b.note && b.note.toLowerCase().includes(q)) {
        matches.push({
          type: 'mood-note',
          label: 'Reflexão',
          snippet: b.note,
        });
      }
    });

    // Search stickers
    (entry.stickers || []).forEach(s => {
      const texts = [s.text, s.prompt, s.author, s.title, s.artist].filter(Boolean);
      texts.forEach(txt => {
        if (txt.toLowerCase().includes(q)) {
          matches.push({
            type: 'sticker',
            label: 'Adesivo',
            snippet: txt,
          });
        }
      });
    });

    if (matches.length > 0) {
      results.push({
        dateKey,
        displayDate: dateLabel,
        matches,
      });
    }
  });

  return results;
};

// Full Backup & Export as JSON
export const exportPlannerData = () => {
  try {
    const dates = getSavedDatesIndex();
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: loadTheme(),
      entries: {},
    };

    dates.forEach(d => {
      const entry = loadDayEntry(d);
      if (entry) backup.entries[d] = entry;
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-backup-${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error exporting planner data:', err);
    return false;
  }
};

// Import & Restore from JSON
export const importPlannerData = (jsonString) => {
  try {
    const backup = JSON.parse(jsonString);
    if (!backup.entries) throw new Error('Formato de backup inválido');

    const dates = Object.keys(backup.entries);
    dates.forEach(d => {
      saveDayEntry(d, backup.entries[d]);
    });

    if (backup.theme) {
      saveTheme(backup.theme);
    }

    return { success: true, count: dates.length };
  } catch (err) {
    console.error('Error importing planner data:', err);
    return { success: false, error: err.message };
  }
};
