import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ApprovalRequests() {
  return (
    <PlaceholderPage
      title="Approval Requests"
      description="Pending requests awaiting manager sign-off across the workflow."
      tag="Manager"
      actions={["Approve", "Reject", "View history"]}
    />
  );
}
