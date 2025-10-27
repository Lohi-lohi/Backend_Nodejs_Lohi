
const express = require('express');
const firmController = require('../controllers/firmController');
const verifyToken = require('../middlewares/verifyToken');


const router = express.Router()

// Protected route (requires token)
// `firmController.addFirm` is exported as an array [middleware, handler]
// spread it so each function is passed separately to the router
router.post('/add-Firm', verifyToken, ...(Array.isArray(firmController.addFirm) ? firmController.addFirm : [firmController.addFirm]));

const path = require('path');
router.get('/uploads/:imageName', (req, res) => {
	const imageName = req.params.imageName;
	// set content type and send file
	res.type('image/jpeg');
	res.sendFile(path.join(__dirname, '..', 'uploads', imageName));
});

// Re-add unprotected test route if controller exports it
if (firmController.testAddFirm) {
    router.post('/test-add-Firm', ...(Array.isArray(firmController.testAddFirm) ? firmController.testAddFirm : [firmController.testAddFirm]));
}

// Temporary debug route: return firm document with populated products
const Firm = require('../models/Firm');
router.get('/debug/:id', async (req, res) => {
	try {
		const firm = await Firm.findById(req.params.id).populate('product');
		if (!firm) return res.status(404).json({ error: 'Firm not found' });
		res.json(firm);
	} catch (err) {
		console.error('firm debug error', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

router.delete('/:firmId', firmController.deleteFirmById);

module.exports = router;