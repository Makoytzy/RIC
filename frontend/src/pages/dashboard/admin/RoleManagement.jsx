import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function RoleManagement() {
  return (
    <PlaceholderPage
      title="Role Management"
      description="Create, edit, and configure roles and the permissions attached to them."
      tag="Administrator"
      actions={["Create role", "Edit permissions", "Delete role"]}
    />
  );
}
