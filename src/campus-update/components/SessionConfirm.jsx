import { Icon } from './Icons.jsx';
import { Modal } from './Modal.jsx';

export default function SessionConfirm({ type, device, sessions = [], onClose, onConfirm }) {
  const all = type === 'all';
  return (
    <Modal title={all ? 'Sign Out of All Sessions' : 'Sign Out'} onClose={onClose} size="session-confirm" hideHeader>
      <button type="button" className="session-modal-close" aria-label="Close dialog" onClick={onClose}><Icon n="x" s={16} /></button>
      <div className={'session-modal-icon' + (all ? ' alert' : '')}><Icon n={all ? 'warning' : 'logout'} s={34} /></div>
      <h2>{all ? 'Sign Out of All Sessions' : 'Sign Out'}</h2>
      <p className="session-modal-copy">
        {all
          ? 'This will sign you out of all active sessions across all devices, including this one. You will need to log in again on each device.'
          : <>Are you sure you want to sign out of <b>{device}</b>? You will need to enter your credentials to log back in.</>}
      </p>
      {all && (
        <div className="session-modal-list">
          <b>ACTIVE SESSIONS TO TERMINATE</b>
          {sessions.map((session) => <span key={session.id}><Icon n="laptop" s={16} />{session.device} · {session.location}</span>)}
        </div>
      )}
      <div className="session-modal-actions">
        <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-danger" onClick={onConfirm}>{all ? 'Sign Out All' : 'Sign Out'}</button>
      </div>
    </Modal>
  );
}
