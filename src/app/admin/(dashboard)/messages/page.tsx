import { desc } from "drizzle-orm";
import { resolveMessageAction } from "@/app/admin/actions";
import { db } from "@/db";
import { contactMessages, newsletterSubscribers } from "@/db/schema";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const [messages, subscribers] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(100),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <section>
        <h1 className="font-display text-2xl font-bold text-slate-900">Support inbox</h1>
        {messages.length === 0 ? (
          <div className="card mt-6 p-10 text-center text-sm text-slate-500">No messages yet. Submissions from the contact page land here.</div>
        ) : (
          <ul className="mt-6 space-y-3">
            {messages.map((message) => (
              <li key={message.id} className={cn("card p-5", message.isResolved && "opacity-60")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{message.subject}</p>
                    <p className="text-xs text-slate-500">
                      {message.name} · {message.email}
                      {message.orderNumber ? ` · ${message.orderNumber}` : ""} · {formatDate(message.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.isResolved ? (
                    <span className="badge bg-emerald-50 text-emerald-700">Resolved</span>
                  ) : (
                    <form action={resolveMessageAction}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <button type="submit" className="btn-outline h-8 px-3 text-xs">
                        Mark resolved
                      </button>
                    </form>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{message.message}</p>
                <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
                  Reply by email →
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-slate-900">Newsletter subscribers</h2>
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-sm">
            <span className="font-semibold text-slate-900">{subscribers.length} subscribers</span>
          </div>
          {subscribers.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No subscribers yet.</p>
          ) : (
            <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
              {subscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="text-slate-800">{subscriber.email}</span>
                  <span className="text-xs text-slate-500">{formatDate(subscriber.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
