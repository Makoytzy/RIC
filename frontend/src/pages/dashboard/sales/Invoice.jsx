import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Invoice() {
  return (
    <PlaceholderPage
      title="Invoice"
      description="Generate invoices for customer orders."
      tag="Sales Staff"
      actions={["New invoice", "View invoices"]}
    />
  );
}
