import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { LockIcon } from "@/components/icons";
import { DEFAULT_ADMIN_PASSWORD, isAdminAuthenticated, isUsingDefaultPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <form action={loginAction} className="card w-full max-w-sm p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 text-accent-400">
          <LockIcon size={24} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Kurovia Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage orders, inventory and customers.</p>
        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">Incorrect password. Please try again.</p>}
        <label className="label mt-6" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" required autoFocus className="input h-11" />
        <button type="submit" className="btn-primary mt-5 h-11 w-full">
          Sign in
        </button>
        {isUsingDefaultPassword() && (
          <p className="mt-4 rounded-xl bg-accent-50 px-3 py-2 text-xs text-accent-700">
            Default password: <code className="font-semibold">{DEFAULT_ADMIN_PASSWORD}</code>. Set <code>ADMIN_PASSWORD</code> in your environment to change it.
          </p>
        )}
      </form>
    </div>
  );
}
