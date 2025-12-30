interface Notification {
  id: string;
  title: string;
  body?: string;
}

interface Props {
  items: Notification[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ items, onDismiss }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {items.map((n) => (
        <div
          key={n.id}
          className="flex items-start w-80 bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-200 hover:scale-[1.01] animate-slide-up"
        >
          <div className="w-2 bg-red-500" />
          <div className="p-3 flex-1">
            <div className="flex justify-between items-start">
              <div className="font-semibold text-sm">{n.title}</div>
              <button
                onClick={() => onDismiss(n.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {n.body && (
              <div className="text-xs text-gray-600 mt-1">{n.body}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
