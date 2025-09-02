import './ModalDialog.scss'

interface Props {
  cancelText?: string
  confirmText?: string
  children?: React.ReactNode
  title?: string
  onCancel?: () => void
  onClose?: () => void
  onConfirm?: () => void
}

export default function ModalDialog({
  cancelText,
  confirmText,
  children,
  title,
  onCancel,
  onClose,
  onConfirm,
}: Props) {
  return (
    <dialog className="modal-dialog" open={true}>
      <article>
        {(title || onClose) && (
          <h3>
            <span>{title ?? ''}</span>
            {onClose && (
              <button className="outline secondary" onClick={onClose}>✕</button>
            )}
          </h3>
        )}
        <div>
          {children}
        </div>
        {(onCancel || onConfirm) && (
          <footer>
            {onCancel && (
              <button className="secondary" onClick={onCancel}>
                {cancelText || 'Cancel'}
              </button>
            )}
            {onConfirm && (
              <button onClick={onConfirm}>
                {confirmText || 'Confirm'}
              </button>
            )}
          </footer>
        )}
      </article>
    </dialog>
  )
}
