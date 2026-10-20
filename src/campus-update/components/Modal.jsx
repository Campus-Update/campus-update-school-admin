import { useEffect, useId, useRef } from 'react';
import { Icon } from './Icons.jsx';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ title, onClose, children, size = 'md' }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();

  useEffect(() => {
    const opener = document.activeElement;
    const el = ref.current;
    (el.querySelector('[data-autofocus]') || el.querySelector('input,select,textarea') || el.querySelector('button'))?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close.current(); }
      if (e.key === 'Tab') {
        const f = [...el.querySelectorAll(FOCUSABLE)];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, []);

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={'modal ' + size} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-h">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}><Icon n="x" s={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** A modal wrapping a <form>. `onSubmit` receives the submit event; validate there. */
export function FormModal({ title, onClose, onSubmit, submitLabel = 'Save changes', children }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <div className="modal-b">{children}</div>
        <div className="modal-f">
          <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-solid">{submitLabel}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmDialog({ title, text, confirmLabel = 'Confirm', danger, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <div className="modal-b"><p className="confirm-text">{text}</p></div>
      <div className="modal-f">
        <button type="button" className="btn btn-line" data-autofocus onClick={onClose}>Cancel</button>
        <button type="button" className={'btn ' + (danger ? 'btn-danger' : 'btn-solid')} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
