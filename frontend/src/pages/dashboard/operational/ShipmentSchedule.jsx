import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ShipmentSchedule() {
  return (
    <PlaceholderPage
      title="Shipment Schedule"
      description="View and manage expected shipment arrival dates and schedules."
      tag="Operational Staff"
      actions={["View schedule","Add shipment date","Update arrival"]}
    />
  );
}
