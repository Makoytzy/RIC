import { Ruler } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function CapacityRules() {
  return (
    <PlaceholderPage
      title="Capacity Rules"
      description="Configure tire-size capacity rules per storage location."
      tag="Administrator"
      icon={Ruler}
      gradient="from-orange-500 to-amber-400"
      stats={[
        { label: 'Active Rules', value: '—', sub: 'No rules configured' },
        { label: 'Locations Mapped', value: '—', sub: 'Pending configuration' },
        { label: 'Overridden Defaults', value: '—', sub: 'No overrides set' },
      ]}
      actions={['Add rule', 'Edit rule', 'View capacity map']}
    />
  );
}
