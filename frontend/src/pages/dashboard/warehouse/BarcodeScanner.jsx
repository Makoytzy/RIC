import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function BarcodeScanner() {
  return (
    <PlaceholderPage
      title="Barcode Scanner"
      description="Scan barcodes to look up or update items in the warehouse."
      tag="Warehouse Staff"
      actions={["Scan item", "Manual lookup"]}
    />
  );
}
