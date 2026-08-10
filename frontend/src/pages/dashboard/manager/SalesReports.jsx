import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function SalesReports() {
  return (
    <PlaceholderPage
      title="Sales Reports"
      description="Revenue, order volume, and sales trends over time."
      tag="Manager"
      actions={["Generate report", "Export CSV", "Schedule report"]}
    />
  );
}
