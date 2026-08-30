import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { QueryService } from '../services/query.service.js';

export class QueryController {
  /**
   * Submit new query
   */
  static async createQuery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category, crop, title, description, location, attachments } = req.body;
      if (!title || !description || !category) {
        sendError(res, 'Title, category, and description are required', 400);
        return;
      }

      const query = await QueryService.createQuery({
        farmerId: req.user!.id,
        category,
        crop,
        title,
        description,
        location: location || 'Tamil Nadu',
        attachments,
      });

      sendSuccess(res, query, 'Query submitted successfully to agricultural officials', 201);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to submit query', 500);
    }
  }

  /**
   * Get farmer's own queries
   */
  static async getMyQueries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const queries = await QueryService.getFarmerQueries(req.user!.id);
      sendSuccess(res, queries);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch queries', 500);
    }
  }

  /**
   * Get all regional queries (Officials & Admin)
   */
  static async getAllQueries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const category = req.query.category as string;
      const queries = await QueryService.getAllQueries({ status, category });
      sendSuccess(res, queries);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch all queries', 500);
    }
  }

  /**
   * Get single query details
   */
  static async getQueryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query = await QueryService.getQueryById(id);
      if (!query) {
        sendError(res, 'Query not found', 404);
        return;
      }
      sendSuccess(res, query);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch query', 500);
    }
  }

  /**
   * Reply to query
   */
  static async replyToQuery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (!content || !content.trim()) {
        sendError(res, 'Reply message content is required', 400);
        return;
      }

      const message = await QueryService.replyToQuery({
        queryId: id,
        senderId: req.user!.id,
        content: content.trim(),
      });

      sendSuccess(res, message, 'Reply sent successfully', 201);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to send reply', 500);
    }
  }

  /**
   * Update query status
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await QueryService.updateStatus(id, status);
      sendSuccess(res, updated, 'Query status updated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update query status', 500);
    }
  }
}
