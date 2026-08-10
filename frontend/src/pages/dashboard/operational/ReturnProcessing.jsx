import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ReturnProcessing() {
  return (
    <PlaceholderPage
      title="Return Processing"
      description="Process incoming customer and supplier returns."
      tag="Operational Staff"
      actions={["New return", "View pending returns"]}
    />
  );
}
