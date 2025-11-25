export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-card/80 border border-white/5 rounded-2xl shadow-md shadow-black/40 ${className}`}
    >
      {children}
    </div>
  );
}
