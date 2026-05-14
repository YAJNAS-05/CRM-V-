import React from 'react'
import { useNotificationStore } from '../../store/notificationStore'

const NotificationsPage: React.FC = () => {
  const { notifications, removeNotification, clearNotifications } = useNotificationStore()

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Workspace</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Notifications</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Review system alerts, approvals, and reminders linked to your work.
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          No notifications yet. Actions and approvals will show up here.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-4 p-4">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  notification.type === 'success'
                    ? 'bg-emerald-500'
                    : notification.type === 'error'
                    ? 'bg-rose-500'
                    : notification.type === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeNotification(notification.id)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
