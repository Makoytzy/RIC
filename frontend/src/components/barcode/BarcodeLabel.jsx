/**
 * ============================================================================
 * BARCODE LABEL COMPONENT
 * ============================================================================
 * Displays a complete barcode label with:
 * - CODE128 barcode (scanner-readable)
 * - QR code (traceability URL)
 * - Product information
 * - Batch and inventory unit details
 * ============================================================================
 */

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { Package, Box, Hash, Calendar } from 'lucide-react';

export default function BarcodeLabel({
  barcode,
  product,
  batch,
  inventoryUnit,
  shipment,
  className = ''
}) {
  const barcodeRef = useRef(null);

  // Generate CODE128 barcode when component mounts or barcode changes
  useEffect(() => {
    if (!barcodeRef.current || !barcode?.barcode_value) {
      return;
    }

    try {
      JsBarcode(
        barcodeRef.current,
        barcode.barcode_value,
        {
          format: 'CODE128',
          displayValue: true,
          text: barcode.barcode_value,
          fontSize: 12,
          height: 60,
          width: 2,
          margin: 5,
          textMargin: 3,
          background: '#ffffff',
          lineColor: '#000000'
        }
      );
    } catch (error) {
      console.error('Barcode generation failed:', error);
    }
  }, [barcode]);

  if (!barcode) {
    return null;
  }

  return (
    <div className={`bg-white border-2 border-slate-300 rounded-lg p-4 shadow-md ${className}`}>
      {/* Header */}
      <div className="text-center mb-3 pb-2 border-b-2 border-slate-200">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Red Indian Customs
        </h3>
        <p className="text-[10px] text-slate-600">Inventory Label</p>
      </div>

      {/* Product Information */}
      {product && (
        <div className="mb-3 space-y-1">
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {product.brand && product.model 
                  ? `${product.brand} ${product.model}` 
                  : product.product_name || 'Product'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <span className="font-mono font-semibold">SKU: {product.sku || '-'}</span>
                {product.dimensions && (
                  <span className="text-[9px]">• {product.dimensions}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Information */}
      {batch && (
        <div className="mb-3 flex items-center gap-2 text-[10px]">
          <Box className="w-3.5 h-3.5 text-purple-600" />
          <span className="font-semibold text-slate-700">
            Batch: <span className="font-mono text-purple-700">{batch.batch_number || '-'}</span>
          </span>
        </div>
      )}

      {/* CODE128 Barcode */}
      <div className="mb-3 bg-white border border-slate-200 rounded p-2 flex items-center justify-center">
        <svg ref={barcodeRef} className="max-w-full h-auto" />
      </div>

      {/* Bottom Section: QR Code + Details */}
      <div className="flex gap-3 items-start">
        {/* QR Code */}
        {barcode.traceability_url && (
          <div className="flex-shrink-0 bg-white border border-slate-200 rounded p-1.5">
            <QRCodeSVG
              value={barcode.traceability_url}
              size={80}
              level="M"
              includeMargin={false}
            />
            <p className="text-[8px] text-center text-slate-500 mt-1">Scan to Trace</p>
          </div>
        )}

        {/* Inventory Details */}
        <div className="flex-1 space-y-1 text-[10px]">
          {inventoryUnit && (
            <div className="flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-emerald-600" />
              <span className="font-mono font-semibold text-emerald-700">
                {inventoryUnit.inventory_unit_code || barcode.inventory_unit_code || '-'}
              </span>
            </div>
          )}

          {shipment?.container_number && (
            <div className="text-slate-600">
              <span className="font-semibold">Container:</span> {shipment.container_number}
            </div>
          )}

          {barcode.created_at && (
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3 h-3" />
              <span className="text-[9px]">
                {new Date(barcode.created_at).toLocaleDateString()}
              </span>
            </div>
          )}

          {barcode.status && (
            <div className="inline-block">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                barcode.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {barcode.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
