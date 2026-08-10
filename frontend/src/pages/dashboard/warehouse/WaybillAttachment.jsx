import PlaceholderPage from '../../../components/common/PlaceholderPage.jsx';

export default function WaybillAttachment() {
  return (
    <PlaceholderPage
      title="Waybill Attachment"
      description="Attach the correct waybill to a packed shipment before dispatch."
      tag="Warehouse Staff"
      actions={["Attach waybill", "View dispatch queue"]}
    />
  );
}
