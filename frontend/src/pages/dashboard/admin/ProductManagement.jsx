import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ProductManagement() {
  return (
    <PlaceholderPage
      title="Product Management"
      description="Maintain the master product catalog: SKUs, categories, units, and pricing."
      tag="Administrator"
      actions={["Add product", "Edit product", "Archive product"]}
    />
  );
}
