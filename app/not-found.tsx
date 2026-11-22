import Link from "next/link";
export default function NotFound() { return (<div className="wrap py-24 text-center"><p className="kicker">404</p><h1 className="mt-2 text-5xl">Page not found</h1><p className="mt-3 text-muted">The page you are looking for does not exist or has moved.</p><Link href="/" className="btn btn-dark mt-6 inline-block">Back to home</Link></div>); }
