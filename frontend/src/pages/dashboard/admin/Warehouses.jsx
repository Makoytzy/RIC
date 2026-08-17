import { Warehouse } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function Warehouses() {
  return (
    <PlaceholderPage
      title="Warehouses"
      description="Configure the warehouse hierarchy: Warehouse → Level → Rack → Section → Subsection → Shelf."
      tag="Administrator"
      icon={Warehouse}
      gradient="from-cyan-600 to-teal-400"
      stats={[
        { label: 'Total Warehouses', value: '—', sub: 'Not yet configured' },
        { label: 'Active Locations', value: '—', sub: 'Pending setup' },
        { label: 'Capacity Utilization', value: '—', sub: 'Awaiting data' },
      ]}
      actions={['Add warehouse', 'Configure levels', 'Manage racks', 'Set shelf layout']}
    />
  );
}
