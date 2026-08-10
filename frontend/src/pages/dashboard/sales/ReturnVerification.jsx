import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ReturnVerification() {
  return (
    <PlaceholderPage
      title="Return Verification"
      description="Verify returned items and condition before issuing a refund."
      tag="Sales Staff"
      actions={["Verify return", "View pending returns"]}
    />
  );
}
