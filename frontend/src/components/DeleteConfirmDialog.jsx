export default function DeleteConfirmDialog({ onClose, onConfirm, postTitle }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          <span className="warning-icon">⚠️</span>
        </div>
        
        <h3 className="confirm-title">Delete Post?</h3>
        
        <p className="confirm-message">
          Are you sure you want to delete <strong>"{postTitle}"</strong>?
          <br />
          This action cannot be undone.
        </p>

        <div className="confirm-actions">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
