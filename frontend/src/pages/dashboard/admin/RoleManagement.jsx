import { ShieldCheck } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function RoleManagement() {
  return (
    <PlaceholderPage
      title="Role Management"
      description="Create, edit, and configure roles and the permissions attached to them."
      tag="Administrator"
      icon={ShieldCheck}
      gradient="from-indigo-600 to-blue-400"
      stats={[
        { label: 'Total Roles', value: '—', sub: 'Not yet configured' },
        { label: 'Assigned Users', value: '—', sub: 'Pending role setup' },
        { label: 'Permission Groups', value: '—', sub: 'Awaiting definition' },
      ]}
      actions={['Create role', 'Edit permissions', 'Delete role']}
    />
  );
}
