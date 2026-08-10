import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function SystemSettings() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure company details, system preferences, and integrations."
      tag="Administrator"
      actions={["General settings", "Notifications", "Integrations"]}
    />
  );
}
