import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Receiving() {
  return (
    <PlaceholderPage
      title="Receiving"
      description="Log incoming shipments as they're received at the dock."
      tag="Warehouse Staff"
      actions={["Receive shipment", "View log"]}
    />
  );
}
