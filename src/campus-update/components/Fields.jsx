import { useId } from 'react';
import { Icon } from './Icons.jsx';
import { STATUSES } from '../data/metrics.js';

function Wrap({ id, label, error, hint, full, children }) {
  return (
    <div className={'fld' + (full ? ' full' : '')}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="hint" id={id + '-d'}>{hint}</p>}
      {error && <p className="err" id={id + '-d'} role="alert">{error}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, error, hint, disabled, lock, full, type = 'text', placeholder, autoComplete, name }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} hint={hint} full={full}>
      <div className={'inp' + (disabled ? ' dis' : '') + (error ? ' bad' : '')}>
        <input
          id={id} name={name} type={type} value={value} disabled={disabled} placeholder={placeholder} autoComplete={autoComplete}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? id + '-d' : undefined}
        />
        {lock && <Icon n="lock" s={16} w={1.5} c="#6b7280" />}
      </div>
    </Wrap>
  );
}

export function SelectField({ label, value, onChange, options, error, full }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} full={full}>
      <div className={'inp sel' + (error ? ' bad' : '')}>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? id + '-d' : undefined}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <Icon n="down" s={16} w={1.8} c="#6b7280" />
      </div>
    </Wrap>
  );
}

export function CheckField({ label, checked, onChange, hint }) {
  const id = useId();
  return (
    <div className="fld full check">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}{hint && <small>{hint}</small>}</label>
    </div>
  );
}

/** Status select, plus a date-time input when "Scheduled" is chosen. */
export function StatusField({ status, scheduledFor, onChange, error, statuses = STATUSES }) {
  return (
    <>
      <SelectField label="Status" value={status} options={statuses} onChange={(v) => onChange({ status: v })} full={status !== 'Scheduled'} />
      {status === 'Scheduled' && (
        <TextField label="Go live on" type="datetime-local" value={scheduledFor || ''} onChange={(v) => onChange({ scheduledFor: v })} error={error} />
      )}
    </>
  );
}

export function AreaField({ label, value, onChange, error, full = true, rows = 4 }) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} full={full}>
      <div className={'inp area' + (error ? ' bad' : '')}>
        <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? id + '-d' : undefined} />
      </div>
    </Wrap>
  );
}
