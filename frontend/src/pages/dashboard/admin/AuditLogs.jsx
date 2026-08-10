import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function AuditLogs() {
  return (
    <PlaceholderPage
      title="Audit Logs"
      description="Searchable history of who did what and when across the system."
      tag="Administrator"
      actions={["Filter by user", "Filter by action", "Export logs"]}
    />
  );
}
