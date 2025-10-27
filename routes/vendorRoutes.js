const vendorController = require('../controllers/vendorController');
const express = require('express');

const router = express.Router();

router.post('/register', vendorController.vendorRegister);
router.post('/login', vendorController.vendorLogin);

router.get('/all-vendors', vendorController.getAllVendors);
// original route
router.get('/single-vendor/:apple', vendorController.getVendorById);
// alias to support clients using plural 'single-vendors' or param named 'id'
router.get('/single-vendors/:id', vendorController.getVendorById);

module.exports = router;
