import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../../lib/api.js';
import { fmtDateTime } from '../lib/format.js';

function getNotificationRows(result) {
  const rows = Array.isArray(result) ? result : result?.notifications ?? result?.items;
  if (!Array.isArray(rows)) {
    throw new Error('The notifications response was not in the expected format.');
  }
  return rows;
}

function getNotificationDate(notification) {
  return notification.createdAt || notification.sentAt || notification.timestamp || '';
}

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await notificationsApi.list();
      setRows(getNotificationRows(result));
    } catch (loadError) {
      setError(`Could not load notifications: ${loadError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (notification) => {
    setMarkingId(notification.id);
    setError('');
    try {
      await notificationsApi.read(notification.id);
      setRows((current) => current.map((row) => row.id === notification.id
        ? { ...row, readAt: new Date().toISOString() }
        : row));
    } catch (markError) {
      setError(`Could not mark notification as read: ${markError.message}`);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <section className="notifications-page" aria-live="polite">
      <div className="notifications-heading">
        <div>
          <h2>Notifications</h2>
          <p>Updates and activity for your institution.</p>
        </div>
        <button type="button" className="btn btn-line" onClick={loadNotifications} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {loading && <p className="notifications-state">Loading notifications…</p>}
      {error && <p className="notifications-error" role="alert">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="notifications-state">You’re all caught up. No notifications yet.</p>
      )}
      {!loading && rows.length > 0 && (
        <ul className="notifications-list">
          {rows.map((notification, index) => {
            const title = notification.title || notification.subject || notification.type || 'Notification';
            const message = notification.message || notification.body || notification.description || '';
            const date = getNotificationDate(notification);
            const unread = !notification.readAt
              && !notification.acknowledgedAt
              && notification.isRead !== true
              && notification.read !== true
              && notification.status !== 'Read';
            return (
              <li key={notification.id ?? notification.notificationId ?? index} className="notifications-item">
                <span className={`notifications-dot${unread ? ' unread' : ''}`} aria-hidden="true" />
                <div className="notifications-copy">
                  <div className="notifications-item-heading">
                    <h3>{title}</h3>
                    {unread && <span className="notifications-unread">Unread</span>}
                  </div>
                  {message && <p>{message}</p>}
                  {date && <time dateTime={date}>{fmtDateTime(date)}</time>}
                </div>
                {unread && notification.id != null && (
                  <button
                    type="button"
                    className="notifications-mark-read"
                    disabled={markingId === notification.id}
                    onClick={() => markRead(notification)}
                  >
                    {markingId === notification.id ? 'Saving…' : 'Mark read'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
