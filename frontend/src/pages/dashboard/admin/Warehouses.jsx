import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Warehouses() {
  return (
    <PlaceholderPage
      title="Warehouses"
      description="Configure the warehouse hierarchy: Warehouse → Level → Rack → Section → Subsection → Shelf."
      tag="Administrator"
      actions={["Add warehouse","Configure levels","Manage racks","Set shelf layout"]}
    />
  );
}
