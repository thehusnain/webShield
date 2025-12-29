import { HiExclamationTriangle, HiX } from "react-icons/hi";
import Button from "./common/Button";
import Card from "./common/Card";

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?:  string;
  message:  string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColors = {
    danger: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const buttonVariants = {
    danger: "danger" as const,
    warning: "primary" as const,
    info:  "primary" as const,
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <Card className="max-w-md w-full animate-slideUp">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full bg-${type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500/10`}>
              <HiExclamationTriangle className={`w-8 h-8 ${iconColors[type]}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} variant="secondary" className="px-6">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={buttonVariants[type]}
            className="px-6"
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}