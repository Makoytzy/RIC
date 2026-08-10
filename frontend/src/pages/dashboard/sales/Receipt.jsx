import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Receipt() {
  return (
    <PlaceholderPage
      title="Receipt"
      description="Generate and reprint receipts for completed sales."
      tag="Sales Staff"
      actions={["Print receipt", "Reprint receipt"]}
    />
  );
}
