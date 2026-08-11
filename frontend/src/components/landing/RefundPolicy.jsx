import Modal from '../common/Modal.jsx';

export default function RefundPolicy({ isOpen, onClose }) {
  return (
    isOpen && (
      <Modal title="Refund policy" onClose={onClose}>
        <div className="space-y-4 text-sm text-slate-600">
          <p>All refund requests are reviewed within 7 business days.</p>
          <p>Products must be returned in their original condition and packaging.</p>
          <p>Shipping costs are non-refundable unless the return is due to our error.</p>
        </div>
      </Modal>
    )
  );
}
