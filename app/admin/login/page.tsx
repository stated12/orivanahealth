import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { adminLogin } from "../actions";
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; c?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const sp = await searchParams;
  const msg: Record<string, string> = { bad: "Email or password is incorrect.", rate: "Too many attempts. Wait a few minutes.", noadmin: "This account is not an admin." };
  const why: Record<string, string> = { no_role: "Signed in, but no staff role is linked to this login (oh_user_roles has no row for this user).", role_query_failed: "Signed in, but the role lookup failed. Check SUPABASE_SERVICE_ROLE_KEY and the Vercel function log.", perm_query_failed: "Signed in, but the permission lookup failed. Check the Vercel function log.", no_permissions: "Signed in, but the role has no permissions in oh_role_permissions (was 04_seed.sql run?).", no_admin_access: "Signed in, but this role cannot enter the admin area." };
  return (<div className="mx-auto max-w-sm px-4 py-20"><h1 className="text-center text-3xl">ORIVANA Health</h1><p className="text-center text-muted">Admin login</p>
    <form action={adminLogin} className="card mt-6 space-y-3 p-5">{sp.e && <p className="text-red-700">{msg[sp.e] || "Error"}{sp.c && why[sp.c] && <span className="mt-1 block text-sm">{why[sp.c]}</span>}</p>}
      <div><label className="label">Email</label><input name="email" type="email" required className="input" autoComplete="username" /></div>
      <div><label className="label">Password</label><input name="password" type="password" required className="input" autoComplete="current-password" /></div>
      <button className="btn btn-dark w-full">Log in</button></form></div>);
}
