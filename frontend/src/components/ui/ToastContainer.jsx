import Toast from './Toast';

const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{ 
            marginTop: index > 0 ? '8px' : '0'
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
