import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function BarcodeConfiguration() {
  return (
    <PlaceholderPage
      title="Barcode Configuration"
      description="Set barcode formats, prefixes, and generation rules for individual tire tracking."
      tag="Administrator"
      actions={["Configure format","Set prefix","Preview barcode"]}
    />
  );
}
