import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Inspection() {
  return (
    <PlaceholderPage
      title="Inspection"
      description="Inspect received stock for quality, damage, and count accuracy."
      tag="Warehouse Staff"
      actions={["Start inspection", "Flag defect"]}
    />
  );
}
