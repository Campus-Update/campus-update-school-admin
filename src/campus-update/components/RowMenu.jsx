import { useEffect, useRef, useState } from 'react';
import { Dots } from './Icons.jsx';

export default function RowMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const btn = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    wrap.current.querySelector('[role="menuitem"]:not([disabled])')?.focus();
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  const onKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const els = [...wrap.current.querySelectorAll('[role="menuitem"]:not([disabled])')];
      const i = els.indexOf(document.activeElement);
      els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
    }
  };

  return (
    <div ref={wrap} className="rowmenu" onKeyDown={onKey}>
      <button ref={btn} type="button" className="dots-btn" aria-label={`Actions for ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Dots />
      </button>
      {open && (
        <div className="pop" role="menu" style={{ right: 0, top: 32 }}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              className={it.danger ? 'danger' : ''}
              onClick={() => { setOpen(false); btn.current?.focus(); it.run?.(); }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
