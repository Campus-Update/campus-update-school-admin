export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty" role="status">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
