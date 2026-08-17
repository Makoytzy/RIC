import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ExpectedInventory() {
  return (
    <PlaceholderPage
      title="Expected Inventory"
      description="Maintain records of expected inventory from incoming shipments."
      tag="Operational Staff"
      actions={["View expected","Update quantities","Match against received"]}
    />
  );
}
