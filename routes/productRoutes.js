
const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Create product (original route)
router.post('/add-product/:firmId', ...(Array.isArray(productController.addProduct) ? productController.addProduct : [productController.addProduct]));

// Alias: allow clients to POST to /:firmId/products (your current URL)
router.post('/:firmId/products', ...(Array.isArray(productController.addProduct) ? productController.addProduct : [productController.addProduct]));

// Get products for a firm
router.get('/:firmId/products', productController.getProductByFirm);

const path = require('path');
router.get('/uploads/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    res.type('image/jpeg');
    res.sendFile(path.join(__dirname, '..', 'uploads', imageName));
});

// Optional delete route only if controller exports it
if (productController.deleteProductById) {
    router.delete('/:productId', productController.deleteProductById);
}

module.exports = router;
