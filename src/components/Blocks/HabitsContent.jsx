import { useState } from 'react';
import { CheckCircle2, Sparkles, Plus, Flame } from 'lucide-react';

const INITIAL_HABITS = [
  { id: 1, label: 'Meditar 10min',   done: true,  streak: '🔥 12' },
  { id: 2, label: 'Ler 30 páginas',  done: true,  streak: '🔥 7'  },
  { id: 3, label: 'Exercício',        done: false, streak: '⚡ 3'  },
  { id: 4, label: 'Sem redes sociais antes das 9h', done: false, streak: '✦ 1' },
];

export default function HabitsContent() {
  const [habits, setHabits] = useState(INITIAL_HABITS);

  const toggle = id => setHabits(h => h.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const done = habits.filter(h => h.done).length;
  const pct = Math.round((done / habits.length) * 100);

  const addHabit = () => {
    const label = prompt('Nome do novo hábito:');
    if (!label) return;
    setHabits(prev => [...prev, { id: Date.now(), label, done: false, streak: '⚡ 1' }]);
  };

  return (
    <div className="habits-widget">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flame size={14} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 600 }}>
            {done}/{habits.length} concluídos hoje
          </span>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
          {pct}% <Sparkles size={11} style={{ display: 'inline' }} />
        </span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 'var(--space-3)' }}>
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="habit-list">
        {habits.map(h => (
          <div key={h.id} className="habit-item">
            <button
              className={`habit-item__check${h.done ? ' done' : ''}`}
              onClick={() => toggle(h.id)}
              id={`widget-habit-${h.id}`}
              title={h.done ? 'Marcar como não feito' : 'Concluir hábito'}
            >
              {h.done && <CheckCircle2 size={12} />}
            </button>
            <span className={`habit-item__label${h.done ? ' done' : ''}`}>{h.label}</span>
            <span className="habit-item__streak">{h.streak}</span>
          </div>
        ))}
      </div>

      <button className="habit-add-btn" onClick={addHabit}>
        <Plus size={12} />
        <span>Novo hábito</span>
      </button>
    </div>
  );
}
