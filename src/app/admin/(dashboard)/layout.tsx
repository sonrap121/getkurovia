import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-x flex h-14 items-center gap-2">
          <span className="mr-4 text-sm font-bold uppercase tracking-wider text-brand-900">Admin</span>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="ml-auto">
            <button type="submit" className="btn-ghost h-9 text-xs">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="container-x py-8">{children}</div>
    </div>
  );
}
