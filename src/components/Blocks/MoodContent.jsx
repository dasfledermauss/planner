import { useState } from 'react';
import { Smile, Sparkles } from 'lucide-react';

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Ótimo',     color: '#EAF8EE' },
  { emoji: '🌟', label: 'Inspirado', color: '#FEF8E7' },
  { emoji: '🔥', label: 'Produtivo', color: '#FEECEB' },
  { emoji: '😐', label: 'Ok',        color: '#F0F4F8' },
  { emoji: '😴', label: 'Cansado',   color: '#EDF2F7' },
  { emoji: '😔', label: 'Difícil',   color: '#F7EEF9' },
];

export default function MoodContent({ data = {}, onChange }) {
  const [selectedMood, setSelectedMood] = useState(data.mood || '😊 Ótimo');
  const [note, setNote] = useState(data.note || 'Hoje me sinto pronto para focar e realizar.');

  const handleSelect = (m) => {
    const nextMood = `${m.emoji} ${m.label}`;
    setSelectedMood(nextMood);
    if (onChange) onChange({ ...data, mood: nextMood, note });
  };

  const handleNoteChange = (text) => {
    setNote(text);
    if (onChange) onChange({ ...data, mood: selectedMood, note: text });
  };

  return (
    <div className="mood-widget">
      <div className="mood-widget__header">
        <div className="mood-widget__title">
          <Smile size={14} style={{ color: 'var(--color-primary)' }} />
          <span>Humor de Hoje</span>
        </div>
        <span className="mood-widget__current">{selectedMood}</span>
      </div>

      {/* Mood Emoji Chips */}
      <div className="mood-widget__chips">
        {MOOD_OPTIONS.map(m => {
          const isSelected = selectedMood.includes(m.label);
          return (
            <button
              key={m.label}
              className={`mood-chip${isSelected ? ' active' : ''}`}
              onClick={() => handleSelect(m)}
              title={m.label}
              style={{ background: isSelected ? 'var(--color-primary-bg)' : undefined }}
            >
              <span className="mood-chip__emoji">{m.emoji}</span>
              <span className="mood-chip__label">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reflection Note */}
      <input
        className="mood-widget__note-input"
        value={note}
        onChange={e => handleNoteChange(e.target.value)}
        placeholder="Como você está se sentindo hoje? Escreva uma reflexão..."
      />
    </div>
  );
}
