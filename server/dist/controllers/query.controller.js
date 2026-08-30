"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryController = void 0;
const response_js_1 = require("../utils/response.js");
const query_service_js_1 = require("../services/query.service.js");
class QueryController {
    /**
     * Submit new query
     */
    static async createQuery(req, res) {
        try {
            const { category, crop, title, description, location, attachments } = req.body;
            if (!title || !description || !category) {
                (0, response_js_1.sendError)(res, 'Title, category, and description are required', 400);
                return;
            }
            const query = await query_service_js_1.QueryService.createQuery({
                farmerId: req.user.id,
                category,
                crop,
                title,
                description,
                location: location || 'Tamil Nadu',
                attachments,
            });
            (0, response_js_1.sendSuccess)(res, query, 'Query submitted successfully to agricultural officials', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to submit query', 500);
        }
    }
    /**
     * Get farmer's own queries
     */
    static async getMyQueries(req, res) {
        try {
            const queries = await query_service_js_1.QueryService.getFarmerQueries(req.user.id);
            (0, response_js_1.sendSuccess)(res, queries);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch queries', 500);
        }
    }
    /**
     * Get all regional queries (Officials & Admin)
     */
    static async getAllQueries(req, res) {
        try {
            const status = req.query.status;
            const category = req.query.category;
            const queries = await query_service_js_1.QueryService.getAllQueries({ status, category });
            (0, response_js_1.sendSuccess)(res, queries);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch all queries', 500);
        }
    }
    /**
     * Get single query details
     */
    static async getQueryById(req, res) {
        try {
            const { id } = req.params;
            const query = await query_service_js_1.QueryService.getQueryById(id);
            if (!query) {
                (0, response_js_1.sendError)(res, 'Query not found', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, query);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to fetch query', 500);
        }
    }
    /**
     * Reply to query
     */
    static async replyToQuery(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            if (!content || !content.trim()) {
                (0, response_js_1.sendError)(res, 'Reply message content is required', 400);
                return;
            }
            const message = await query_service_js_1.QueryService.replyToQuery({
                queryId: id,
                senderId: req.user.id,
                content: content.trim(),
            });
            (0, response_js_1.sendSuccess)(res, message, 'Reply sent successfully', 201);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to send reply', 500);
        }
    }
    /**
     * Update query status
     */
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await query_service_js_1.QueryService.updateStatus(id, status);
            (0, response_js_1.sendSuccess)(res, updated, 'Query status updated');
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message || 'Failed to update query status', 500);
        }
    }
}
exports.QueryController = QueryController;
