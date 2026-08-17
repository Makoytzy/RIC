import { ScrollText } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function AuditLogs() {
  return (
    <PlaceholderPage
      title="Audit Logs"
      description="Searchable history of who did what and when across the system."
      tag="Administrator"
      icon={ScrollText}
      gradient="from-rose-600 to-pink-400"
      stats={[
        { label: 'Total Events Logged', value: '—', sub: 'Logging not yet active' },
        { label: 'Unique Users', value: '—', sub: 'No activity recorded' },
        { label: 'Last Event', value: '—', sub: 'No events yet' },
      ]}
      actions={['Filter by user', 'Filter by action', 'Export logs']}
    />
  );
}
