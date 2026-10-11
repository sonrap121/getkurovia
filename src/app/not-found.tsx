import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-display text-7xl font-bold text-brand-100">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">This page took a wrong turn at customs</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to shopping.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back home
        </Link>
        <Link href="/shop" className="btn-outline">
          Browse products
        </Link>
      </div>
    </div>
  );
}
