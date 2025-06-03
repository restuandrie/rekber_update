
import React from 'react';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../constants';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const baseStyles = "p-4 rounded-md shadow-lg mb-4 flex items-start";
  const typeStyles = {
    success: "bg-green-50 text-green-700",
    error: "bg-red-50 text-red-700",
    warning: "bg-yellow-50 text-yellow-700",
    info: "bg-blue-50 text-blue-700",
  };
  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3" />,
    info: <ExclamationTriangleIcon className="w-6 h-6 text-blue-500 mr-3" />, // Using Exclamation for info too
  };

  if (!message) return null;

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`} role="alert">
      {icons[type]}
      <div className="flex-1">
        <p className="font-medium">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </p>
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5">
          <XCircleIcon className={`w-5 h-5 ${typeStyles[type].replace('bg-', 'text-').split(' ')[1]}`} />
        </button>
      )}
    </div>
  );
};

export default Alert;
    