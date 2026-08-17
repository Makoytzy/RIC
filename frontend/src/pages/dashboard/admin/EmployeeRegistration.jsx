import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function EmployeeRegistration() {
  return (
    <PlaceholderPage
      title="Employee Registration"
      description="Generate and manage employee biometric codes for system access."
      tag="Administrator"
      actions={["Generate code","View all codes","Deactivate code"]}
    />
  );
}
