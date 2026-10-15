import { Icon } from './Icons.jsx';

export default function Pagination({ total, page, pages, pageSize, onPage }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <nav className="pager" aria-label="Pagination">
      <span aria-live="polite">{total === 0 ? 'Showing 0 of 0' : `Showing ${start}–${end} of ${total}`}</span>
      <div className="pg">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <Icon n="left" s={16} w={1.8} />
        </button>
        <span>Page {page} of {pages}</span>
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          <Icon n="right" s={16} w={1.8} />
        </button>
      </div>
    </nav>
  );
}
