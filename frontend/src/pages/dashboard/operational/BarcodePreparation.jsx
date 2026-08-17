import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function BarcodePreparation() {
  return (
    <PlaceholderPage
      title="Barcode Preparation"
      description="Prepare barcode and label information for incoming shipments before receiving."
      tag="Operational Staff"
      actions={["Prepare labels","Preview barcodes","Print batch"]}
    />
  );
}
