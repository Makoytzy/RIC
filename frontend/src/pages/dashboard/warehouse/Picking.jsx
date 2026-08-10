import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Picking() {
  return (
    <PlaceholderPage
      title="Picking"
      description="Pick items from storage locations to fulfill an order."
      tag="Warehouse Staff"
      actions={["Start pick list", "View assigned orders"]}
    />
  );
}
