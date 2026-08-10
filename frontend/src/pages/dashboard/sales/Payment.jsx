import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Payment() {
  return (
    <PlaceholderPage
      title="Payment"
      description="Process and record payments against orders."
      tag="Sales Staff"
      actions={["Take payment", "View payment history"]}
    />
  );
}
