import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function StockMovementReports() {
  return (
    <PlaceholderPage
      title="Stock Movement Reports"
      description="Track inbound, outbound, and internal stock transfers."
      tag="Manager"
      actions={["Generate report", "Export CSV"]}
    />
  );
}
