export default function Logo({ size = 44 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0b2545" /><path d="M32 14c-9 0-16 7-16 16 0 11 16 20 16 20s16-9 16-20c0-9-7-16-16-16z" fill="#8fc5a3" /><path d="M32 22v16M24 30h16" stroke="#0b2545" strokeWidth="4.5" strokeLinecap="round" /><circle cx="32" cy="30" r="13.5" fill="none" stroke="#c9a96a" strokeWidth="1.6" /></svg>);
}
