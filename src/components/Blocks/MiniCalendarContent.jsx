/* MiniCalendarContent — Interactive Mini Calendar with date navigation & entry indicators */
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateKey } from '../../services/storage';

export default function MiniCalendarContent({ currentDate, onSelectDate, savedDates = [] }) {
  const selected = currentDate ? new Date(currentDate) : new Date();
  const [viewDate, setViewDate] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const jumpToToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    if (onSelectDate) onSelectDate(today);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const now = new Date();
  const isCurrentMonthNow = now.getFullYear() === viewYear && now.getMonth() === viewMonth;
  const isSelectedMonth = selected.getFullYear() === viewYear && selected.getMonth() === viewMonth;

  const handleDayClick = (d) => {
    if (!d || !onSelectDate) return;
    const target = new Date(viewYear, viewMonth, d);
    onSelectDate(target);
  };

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <div className="mini-cal__title-group">
          <span className="mini-cal__month-title">
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </span>
        </div>

        <div className="mini-cal__controls">
          <button
            className="mini-cal__nav-btn"
            onClick={prevMonth}
            title="Mês anterior"
            type="button"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            className="mini-cal__today-btn"
            onClick={jumpToToday}
            title="Ir para o mês atual"
            type="button"
          >
            Hoje
          </button>
          <button
            className="mini-cal__nav-btn"
            onClick={nextMonth}
            title="Próximo mês"
            type="button"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mini-cal__grid">
        {DAY_LABELS.map((l, i) => (
          <div key={`dl-${i}`} className="mini-cal__day-label">{l}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="mini-cal__day empty" />;

          const dayKey = formatDateKey(new Date(viewYear, viewMonth, d));
          const isTodayCell = isCurrentMonthNow && now.getDate() === d;
          const isSelectedCell = isSelectedMonth && selected.getDate() === d;
          const hasEntry = savedDates.includes(dayKey);

          return (
            <button
              key={`day-${d}`}
              type="button"
              onClick={() => handleDayClick(d)}
              className={[
                'mini-cal__day',
                isTodayCell ? 'today' : '',
                isSelectedCell ? 'selected' : '',
                hasEntry ? 'has-event' : '',
              ].filter(Boolean).join(' ')}
              title={`${d} de ${monthName} ${hasEntry ? '· Contém anotações' : ''}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
