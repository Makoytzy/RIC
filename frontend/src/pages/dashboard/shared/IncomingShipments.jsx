import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function IncomingShipments() {
  return (
    <PlaceholderPage
      title="Incoming Shipments"
      description="Track shipments en route to the warehouse and their expected arrival."
      tag="Operational & Warehouse"
      actions={["View schedule", "Flag delay"]}
    />
  );
}
