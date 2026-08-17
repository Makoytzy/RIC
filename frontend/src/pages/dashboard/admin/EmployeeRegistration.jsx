import { UserPlus } from 'lucide-react';
import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function EmployeeRegistration() {
  return (
    <PlaceholderPage
      title="Employee Registration"
      description="Generate and manage employee biometric codes for system access."
      tag="Administrator"
      icon={UserPlus}
      gradient="from-sky-600 to-blue-400"
      stats={[
        { label: 'Registered Employees', value: '—', sub: 'Not yet enrolled' },
        { label: 'Active Codes', value: '—', sub: 'No codes generated' },
        { label: 'Deactivated Codes', value: '—', sub: 'No history yet' },
      ]}
      actions={['Generate code', 'View all codes', 'Deactivate code']}
    />
  );
}
