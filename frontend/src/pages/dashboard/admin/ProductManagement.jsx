import { Package } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function ProductManagement() {
  return (
    <PlaceholderPage
      title="Product Management"
      description="Maintain the master product catalog: SKUs, categories, units, and pricing."
      tag="Administrator"
      icon={Package}
      gradient="from-emerald-600 to-green-400"
      stats={[
        { label: 'Total SKUs', value: '—', sub: 'Catalog not yet populated' },
        { label: 'Categories', value: '—', sub: 'Not configured' },
        { label: 'Archived Products', value: '—', sub: 'Awaiting data' },
      ]}
      actions={['Add product', 'Edit product', 'Archive product']}
    />
  );
}
