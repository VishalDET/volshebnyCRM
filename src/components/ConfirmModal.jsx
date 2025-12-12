import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {title || 'Are you sure?'}
                </h3>
                <p className="text-secondary-600 mb-6">
                    {message || 'This action cannot be undone.'}
                </p>
                <div className="flex gap-3 w-full justify-center">
                    <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => { onConfirm(); onClose(); }}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmModal
