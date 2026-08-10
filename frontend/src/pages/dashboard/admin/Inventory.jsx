import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Inventory() {
  return (
    <PlaceholderPage
      title="Inventory"
      description="System-wide view of stock levels across all warehouses and locations."
      tag="Administrator"
      actions={["View stock levels", "Adjust inventory", "Export report"]}
    />
  );
}
