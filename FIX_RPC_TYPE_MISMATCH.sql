-- ============================================================================
-- FIX RPC FUNCTION TYPE MISMATCH
-- ============================================================================
-- Error: Returned type VARCHAR(100) does not match expected type TEXT
-- Solution: Cast all VARCHAR columns to TEXT in the function
-- ============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_barcodes_with_traceability(INTEGER);

-- Recreate with proper type casting
CREATE OR REPLACE FUNCTION public.get_barcodes_with_traceability(
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    barcode_id UUID,
    barcode_value TEXT,
    barcode_type TEXT,
    traceability_url TEXT,
    qr_code_data TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    product_id UUID,
    product_sku TEXT,
    product_brand TEXT,
    product_model TEXT,
    batch_id UUID,
    batch_number TEXT,
    container_number TEXT,
    bl_number TEXT,
    shipment_number TEXT,
    supplier_name TEXT,
    inventory_unit_id UUID,
    inventory_unit_code TEXT,
    unit_status TEXT,
    warehouse_location TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as barcode_id,
        b.barcode_value::TEXT,                    -- Cast to TEXT
        b.barcode_type::TEXT,                     -- Cast to TEXT
        b.traceability_url::TEXT,                 -- Cast to TEXT
        b.qr_code_data::TEXT,                     -- Cast to TEXT
        b.status::TEXT,                           -- Cast to TEXT
        b.created_at,
        p.id as product_id,
        p.sku::TEXT as product_sku,               -- Cast to TEXT
        p.brand::TEXT as product_brand,           -- Cast to TEXT
        p.model::TEXT as product_model,           -- Cast to TEXT
        bat.id as batch_id,
        bat.batch_number::TEXT,                   -- Cast to TEXT
        s.container_number::TEXT,                 -- Cast to TEXT
        s.bl_number::TEXT,                        -- Cast to TEXT
        s.shipment_number::TEXT,                  -- Cast to TEXT
        sup.name::TEXT as supplier_name,          -- Cast to TEXT
        iu.id as inventory_unit_id,
        iu.inventory_unit_code::TEXT,             -- Cast to TEXT
        iu.status::TEXT as unit_status,           -- Cast to TEXT
        CASE 
            WHEN w.name IS NOT NULL THEN 
                (w.name || ' - ' || 
                COALESCE(iu.level::TEXT, '') || ' ' || 
                COALESCE(iu.rack::TEXT, '') || ' ' || 
                COALESCE(iu.shelf::TEXT, ''))::TEXT
            ELSE NULL::TEXT
        END as warehouse_location
    FROM public.barcodes b
    INNER JOIN public.inventory_units iu ON b.inventory_unit_id = iu.id
    INNER JOIN public.products p ON iu.product_id = p.id
    INNER JOIN public.batches bat ON iu.batch_id = bat.id
    INNER JOIN public.shipments s ON bat.shipment_id = s.id
    LEFT JOIN public.suppliers sup ON s.supplier_id = sup.id
    LEFT JOIN public.warehouses w ON iu.warehouse_id = w.id
    ORDER BY b.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.get_barcodes_with_traceability IS 
'Retrieve barcodes with complete traceability information in a single query (with type casting)';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_barcodes_with_traceability TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_barcodes_with_traceability TO anon;

-- Test the function
SELECT 
    'Function Test' as test_name,
    COUNT(*) as result_count
FROM get_barcodes_with_traceability(10);

-- Show first 3 results
SELECT 
    barcode_value,
    product_brand,
    product_model,
    product_sku,
    batch_number
FROM get_barcodes_with_traceability(3);

-- ============================================================================
-- If you still get errors, run CHECK_TABLE_STRUCTURE.sql to see column types
-- ============================================================================
