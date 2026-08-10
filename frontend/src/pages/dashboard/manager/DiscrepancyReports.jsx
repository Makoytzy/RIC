import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function DiscrepancyReports() {
  return (
    <PlaceholderPage
      title="Discrepancy Reports"
      description="Mismatches between expected and actual stock counts."
      tag="Manager"
      actions={["Generate report", "Export CSV"]}
    />
  );
}
