/* MiniCalendarContent — shared between App.jsx and MiniCalBlock */
import { CalendarDays } from 'lucide-react';

export default function MiniCalendarContent() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const DAY_LABELS = ['D','S','T','Q','Q','S','S'];
  const EVENTS = [3, 7, 14, 18, 22, 25, today];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <span>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
        <CalendarDays size={13} style={{ color: 'var(--color-text-3)' }} />
      </div>
      <div className="mini-cal__grid">
        {DAY_LABELS.map((l, i) => (
          <div key={`dl-${i}`} className="mini-cal__day-label">{l}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={[
              'mini-cal__day',
              d === today ? 'today' : '',
              d && EVENTS.includes(d) && d !== today ? 'has-event' : '',
            ].filter(Boolean).join(' ')}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}
