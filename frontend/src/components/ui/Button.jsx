export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-transform duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/40",
    ghost: "bg-transparent text-textMain border border-white/10 hover:bg-white/5",
  };

  const styles = `${base} ${variants[variant]} ${className}`;

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
