import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ShipmentDocuments() {
  return (
    <PlaceholderPage
      title="Shipment Documents"
      description="Encode and manage shipment documents: BL number, packing list, container number."
      tag="Operational Staff"
      actions={["Add document","Attach packing list","Enter BL number"]}
    />
  );
}
