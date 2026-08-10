import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function SalesOrders() {
  return (
    <PlaceholderPage
      title="Sales Orders"
      description="View and manage customer sales orders."
      tag="Sales Staff"
      actions={["New order", "View orders"]}
    />
  );
}
