import Modal from '../common/Modal.jsx';

export default function TermsOfService({ isOpen, onClose }) {
  return (
    isOpen && (
      <Modal title="Terms of Service" onClose={onClose}>
        <div className="space-y-4 text-sm text-slate-600">
          <p>By using this service, you agree to our terms and policies.</p>
          <p>Your access may be restricted based on account role and approved usage.</p>
          <p>Unauthorized actions may result in account suspension.</p>
        </div>
      </Modal>
    )
  );
}
