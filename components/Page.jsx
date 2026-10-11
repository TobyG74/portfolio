export default function Page({ id, children, className = "" }) {
  return (
    <section id={id} className={`page ${className}`}>
      <div className="site-container">{children}</div>
    </section>
  );
}
