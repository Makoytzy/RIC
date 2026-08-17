import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function InventoryCount() {
  return (
    <PlaceholderPage
      title="Inventory Count"
      description="Perform physical inventory counts and record stock levels per location."
      tag="Warehouse Staff"
      actions={["Start count","Record count","Submit count","View history"]}
    />
  );
}
