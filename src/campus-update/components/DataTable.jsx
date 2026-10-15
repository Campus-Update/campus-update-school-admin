import { useMemo, useState } from 'react';
import { SortIcon } from './Icons.jsx';
import Pagination from './Pagination.jsx';

/**
 * columns: [{ key, label, sort?: boolean, sortValue?: (row) => string|number, render?: (row) => node, hidden?: boolean }]
 */
export default function DataTable({ caption, columns, rows, pageSize = 10, pager = true, empty, rowLabel }) {
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const val = col.sortValue || ((r) => r[col.key]);
    const out = [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      if (typeof x === 'number' && typeof y === 'number') return x - y;
      return String(x).localeCompare(String(y), undefined, { numeric: true });
    });
    return sort.dir === 'desc' ? out.reverse() : out;
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const slice = pager ? sorted.slice((current - 1) * pageSize, current * pageSize) : sorted;

  const toggle = (key) => {
    setPage(1);
    setSort((s) => (!s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));
  };

  if (rows.length === 0) return <div className="tcard">{empty}</div>;

  return (
    <>
      <div className="tcard">
        <div className="scroll" tabIndex={0} role="region" aria-label={caption}>
          <table>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : c.sort ? 'none' : undefined}
                  >
                    {c.sort ? (
                      <button type="button" onClick={() => toggle(c.key)}>
                        {c.label}
                        <SortIcon />
                      </button>
                    ) : c.hidden ? (
                      <span className="sr-only">{c.label}</span>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pager && <Pagination total={sorted.length} page={current} pages={pages} pageSize={pageSize} onPage={setPage} />}
    </>
  );
}
