import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function InventoryReports() {
  return (
    <PlaceholderPage
      title="Inventory Reports"
      description="Stock levels, valuation, and turnover across the warehouse."
      tag="Manager"
      actions={["Generate report", "Export CSV", "Schedule report"]}
    />
  );
}
