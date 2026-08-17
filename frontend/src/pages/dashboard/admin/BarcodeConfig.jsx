import { ScanBarcode } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function BarcodeConfiguration() {
  return (
    <PlaceholderPage
      title="Barcode Configuration"
      description="Set barcode formats, prefixes, and generation rules for individual tire tracking."
      tag="Administrator"
      icon={ScanBarcode}
      gradient="from-slate-700 to-slate-500"
      stats={[
        { label: 'Active Format', value: '—', sub: 'No format selected' },
        { label: 'Prefix Pattern', value: '—', sub: 'Not configured' },
        { label: 'Barcodes Generated', value: '—', sub: 'No history yet' },
      ]}
      actions={['Configure format', 'Set prefix', 'Preview barcode']}
    />
  );
}
