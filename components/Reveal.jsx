export default function Reveal({ children, className = "", as = "div" }) {
  const Tag = as;
  return (
    <Tag className={className}>
      {children}
    </Tag>
  );
}
