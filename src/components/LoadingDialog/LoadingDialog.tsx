import './LoadingDialog.scss'

export default function LoadingDialog({ text }: { text?: string }) {
  return (
    <dialog className="loading-dialog" open={true}>
      <article>
        <span aria-busy="true">{text || 'Loading...'}</span>
      </article>
    </dialog>
  )
}
