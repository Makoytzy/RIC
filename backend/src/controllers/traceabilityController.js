import * as traceabilityService from '../services/traceabilityService.js';
import { logger } from '../utils/logger.js';

/**
 * Traceability Controller
 * Handles full product lifecycle tracking requests
 */

/**
 * GET /api/traceability/:barcode - Get complete traceability data
 */
export async function getTraceability(req, res, next) {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode value is required' });
    }

    const traceability = await traceabilityService.getTraceabilityByBarcode(barcode);

    if (!traceability) {
      return res.status(404).json({ 
        error: 'Barcode not found',
        message: `No traceability data found for barcode: ${barcode}`,
      });
    }

    return res.json({
      message: 'Traceability data retrieved successfully',
      data: traceability,
    });
  } catch (err) {
    logger.error('Error fetching traceability:', err);
    return next(err);
  }
}

/**
 * GET /api/traceability/:barcode/timeline - Get chronological event timeline
 */
export async function getTraceabilityTimeline(req, res, next) {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode value is required' });
    }

    const timeline = await traceabilityService.getTraceabilityTimeline(barcode);

    if (!timeline) {
      return res.status(404).json({ 
        error: 'Barcode not found',
        message: `No timeline data found for barcode: ${barcode}`,
      });
    }

    return res.json({
      message: 'Timeline retrieved successfully',
      data: timeline,
    });
  } catch (err) {
    logger.error('Error fetching timeline:', err);
    return next(err);
  }
}

export default {
  getTraceability,
  getTraceabilityTimeline,
};
