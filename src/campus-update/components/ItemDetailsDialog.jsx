import { Modal } from './Modal.jsx';
import { Icon } from './Icons.jsx';

export default function ItemDetailsDialog({ item, fields, onClose, placeholderIcon = 'news' }) {
  const description = item.body || item.summary || item.description;
  const addedOn = item.createdAt || item.addedAt;
  const addedOnLabel = addedOn && !Number.isNaN(new Date(addedOn).getTime())
    ? new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(addedOn))
    : '—';

  return (
    <Modal title="View" onClose={onClose} size="view-details">
      <div className="view-details-content">
        {item.imageUrl ? (
          <img className="view-details-image" src={item.imageUrl} alt="" />
        ) : (
          <div className="view-details-image-placeholder" aria-hidden="true">
            <Icon n={placeholderIcon} s={42} w={1.3} />
          </div>
        )}
        <h3 className="view-details-title">{item.title}</h3>
        {description && <p className="view-details-description">{description}</p>}
        <dl className="view-details-fields">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className={label === 'Status' && String(value).toLowerCase() === 'live' ? 'view-details-live' : ''}>
                {value || '—'}
              </dd>
            </div>
          ))}
          <div>
            <dt>Added on</dt>
            <dd>{addedOnLabel}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
