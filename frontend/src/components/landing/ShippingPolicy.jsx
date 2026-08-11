import Modal from '../common/Modal.jsx';

export default function ShippingPolicy({ isOpen, onClose }) {
  return (
    isOpen && (
      <Modal title="Shipping Policy" onClose={onClose}>
        <div className="space-y-4 text-sm text-slate-600">
          <p>Orders are processed within 1-2 business days.</p>
          <p>Shipping time varies based on destination and carrier availability.</p>
          <p>Tracking details are provided once your order ships.</p>
        </div>
      </Modal>
    )
  );
}
