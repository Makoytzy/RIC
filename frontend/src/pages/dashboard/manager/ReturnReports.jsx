import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ReturnReports() {
  return (
    <PlaceholderPage
      title="Return Reports"
      description="Volume and reasons for customer and supplier returns."
      tag="Manager"
      actions={["Generate report", "Export CSV"]}
    />
  );
}
