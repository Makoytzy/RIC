import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Customer() {
  return (
    <PlaceholderPage
      title="Customer"
      description="Manage customer records and purchase history."
      tag="Sales Staff"
      actions={["New customer", "Search customers"]}
    />
  );
}
