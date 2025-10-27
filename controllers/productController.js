
const mongoose = require('mongoose');
const Product = require("../models/product");
const multer = require('multer');
const Firm = require("../models/Firm");
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const addProduct = async (req, res) => {
    try {
        
            const { productName, price, category, bestSeller, description } = req.body;
            const image = req.file ? req.file.filename : undefined;

            const firmId = req.params.firmId;

            // Validate firmId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(firmId)) {
                console.error('Invalid firmId provided:', firmId);
                return res.status(400).json({ error: 'Invalid firm id' });
            }

            const firm = await Firm.findById(firmId);

            if (!firm) {
                return res.status(404).json({error: 'No firm found'});
            }

            const product = new Product({
                productName,
                price,
                category,
                image,
                bestSeller,
                description,
                firm: firm._id
            });

            const savedProduct = await product.save();

            // Debug: log saved product id
            console.log('savedProduct._id ->', savedProduct._id);

            // ensure firm has a product array (will create if not present)
            if (!Array.isArray(firm.product)) {
                firm.product = [];
            }

            // Debug: log firm.product before push
            console.log('firm.product before push ->', firm.product);

            firm.product.push(savedProduct._id);

            // Debug: log firm.product after push (in-memory)
            console.log('firm.product after push ->', firm.product);

            // Persist using atomic $push to ensure update in DB
            const firmIdStr = firm._id && firm._id.toString();
            console.log('firm._id string ->', firmIdStr);
            console.log('mongoose connection db ->', mongoose.connection && mongoose.connection.name);

            const updatedFirm = await Firm.findByIdAndUpdate(
                firm._id,
                { $addToSet: { product: savedProduct._id } },
                { new: true }
            ).lean();

            console.log('updatedFirm (raw) ->', updatedFirm);
            console.log('updatedFirm.product from findByIdAndUpdate ->', updatedFirm && updatedFirm.product);

            // Also attempt to save original document as a fallback and log result
            const savedFirmDoc = await firm.save();
            console.log('savedFirmDoc.product ->', savedFirmDoc.product);

            // Direct DB read to confirm persisted state
            const directFind = await Firm.findOne({ _id: firm._id }).lean();
            console.log('direct findOne ->', directFind && directFind.product);

            return res.status(201).json(savedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"})
    }
}

const getProductByFirm = async (req, res) => {
    try {
        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);

        if (!firm) {
            return res.status(404).json({error: 'No firm found'});
        }
        const restaurantName = firm.firmName;
        const products = await Product.find({ firm: firmId });
        return res.status(200).json({ restaurantName,products });

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
};

const deleteProductById = async (req, res) => {
        try{
            const productId = req.params.productId;

            const deletedProduct = await Product.findByIdAndDelete(productId);

            if(!deletedProduct){
                return res.status(404).json({error: "No Product found"})
            }
        }catch(error){
            console.error(error);
            res.status(500).json({error: "Internal server error"});
        }
}

module.exports = {
    addProduct: [upload.single('image'), addProduct],
    getProductByFirm,deleteProductById
};
