import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function FifoPicking() {
  return (
    <PlaceholderPage
      title="FIFO Picking"
      description="Pick stock in first-in-first-out order to reduce expiry loss."
      tag="Warehouse Staff"
      actions={["Start FIFO pick", "View batch order"]}
    />
  );
}
