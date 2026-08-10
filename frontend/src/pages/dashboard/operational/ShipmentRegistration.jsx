import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ShipmentRegistration() {
  return (
    <PlaceholderPage
      title="Shipment Registration"
      description="Register new incoming shipments before they arrive at the warehouse."
      tag="Operational Staff"
      actions={["New shipment", "View pending"]}
    />
  );
}
