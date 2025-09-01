import './ModalDialog.scss'

interface Props {
  cancelText?: string
  confirmText?: string
  children?: React.ReactNode
  title?: string
  onCancel?: () => void
  onConfirm?: () => void
}

export default function ModalDialog({
  cancelText,
  confirmText,
  children,
  title,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <dialog className="modal-dialog" open={true}>
      <article>
        {title && (
          <h3>{title}</h3>
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
