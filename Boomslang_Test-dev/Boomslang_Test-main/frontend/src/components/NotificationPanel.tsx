import React from 'react'
import { useNotificationStore } from '@/store/notificationStore'

/**
 * Notification Panel Component
 * Displays in-app notifications from the notification store
 */
const NotificationPanel: React.FC = () => {
  const { notifications, removeNotification, clearNotifications } = useNotificationStore()

  if (notifications.length === 0) {
    return null
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: '✓', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' }
      case 'error':
        return { icon: '✕', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' }
      case 'warning':
        return { icon: '⚠', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' }
      case 'info':
        return { icon: 'ℹ', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' }
      default:
        return { icon: 'ℹ', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300' }
    }
  }

  return (
    <section
      aria-live="polite"
      aria-atomic="false"
      className="fixed left-2 right-2 top-20 z-50 space-y-2 sm:left-auto sm:right-4 sm:w-[22rem]"
    >
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">In-app notifications</p>
        <button
          type="button"
          onClick={clearNotifications}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Dismiss all
        </button>
      </div>
      {notifications.map((notification) => {
        const { icon, bgColor, textColor, borderColor } = getIconAndColor(notification.type)

        return (
          <div
            key={notification.id}
            className={`${bgColor} ${textColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg flex justify-between items-start animate-slide-in`}
          >
            <div className="flex items-start">
              <span className="text-xl font-bold mr-3">{icon}</span>
              <div>
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Dismiss ${notification.title} notification`}
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-lg hover:opacity-70 transition"
            >
              ✕
            </button>
          </div>
        )
      })}
    </section>
  )
}

export default NotificationPanel
