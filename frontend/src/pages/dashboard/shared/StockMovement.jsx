import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function StockMovement() {
  return (
    <PlaceholderPage
      title="Stock Movement"
      description="Track and review inventory movements between storage locations."
      tag="Manager / Warehouse Staff"
      actions={["View movements","Filter by date","Export log"]}
    />
  );
}
