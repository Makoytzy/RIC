import { Boxes } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Inventory() {
  return (
    <PlaceholderPage
      title="Inventory"
      description="System-wide view of stock levels across all warehouses and locations."
      tag="Administrator"
      icon={Boxes}
      gradient="from-brand-600 to-brand-400"
      stats={[
        { label: 'Total Stock Units', value: '—', sub: 'Across all warehouses' },
        { label: 'Low Stock Alerts', value: '—', sub: 'Threshold not configured' },
        { label: 'Last Audit Date', value: '—', sub: 'No audit run yet' },
      ]}
      actions={['View stock levels', 'Adjust inventory', 'Export report']}
    />
  );
}
