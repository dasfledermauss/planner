import { useRef, useState, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import './FloatingPanel.css';

export default function FloatingPanel({ title, icon: Icon, children, onClose, initialPos }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(initialPos || { top: 80, right: 24 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    dragging.current = true;
    const rect = ref.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      setPos({
        top:  e.clientY - offset.current.y,
        left: e.clientX - offset.current.x,
        right: 'auto',
      });
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const style = pos.left != null
    ? { top: pos.top, left: pos.left }
    : { top: pos.top, right: pos.right };

  return (
    <div ref={ref} className="fpanel" style={style} role="dialog" aria-label={title}>
      <div className="fpanel__drag-handle" onMouseDown={onMouseDown}>
        <div className="fpanel__title">
          {Icon && <Icon size={14} />}
          {title}
        </div>
        <button className="fpanel__close" onClick={onClose} aria-label="Fechar painel">
          <X size={13} />
        </button>
      </div>
      <div className="fpanel__body">
        {children}
      </div>
    </div>
  );
}
