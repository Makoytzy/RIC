import { Settings2 } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function SystemSettings() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure company details, system preferences, and integrations."
      tag="Administrator"
      icon={Settings2}
      gradient="from-violet-600 to-purple-400"
      stats={[
        { label: 'Active Integrations', value: '—', sub: 'Pending configuration' },
        { label: 'Notification Rules', value: '—', sub: 'Not yet set' },
        { label: 'System Uptime', value: '—', sub: 'Awaiting monitoring' },
      ]}
      actions={['General settings', 'Notifications', 'Integrations']}
    />
  );
}
