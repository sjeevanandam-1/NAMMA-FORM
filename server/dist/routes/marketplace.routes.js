"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketplace_controller_js_1 = require("../controllers/marketplace.controller.js");
const router = (0, express_1.Router)();
router.get('/', marketplace_controller_js_1.MarketplaceController.getMarketplaceListings);
router.get('/:id', marketplace_controller_js_1.MarketplaceController.getListingDetail);
exports.default = router;
