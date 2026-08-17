import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function LocationLookup() {
  return (
    <PlaceholderPage
      title="Location Lookup"
      description="Look up the exact Warehouse → Level → Rack → Section → Subsection → Shelf location and full traceability of any tire."
      tag="Warehouse Staff"
      actions={["Search by barcode","Search by location","View history"]}
    />
  );
}
