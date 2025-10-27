
const Firm = require('../models/Firm');
const Vendor = require('../models/vendor');
const multer = require('multer');
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

const addFirm = async (req, res) => {
    try {
        // Log incoming request for debugging
        console.log('addFirm received body:', req.body);
        console.log('addFirm received file:', req.file);

        // Accept either correct field `firmName` or common typo `fireName`
        const firmNameValue = (req.body.firmName || req.body.fireName || '').toString().trim();
        const area = req.body.area;
        const category = req.body.category;
        const region = req.body.region;
        const offer = req.body.offer;

        // Basic server-side validation for required fields
        if (!firmNameValue) {
            return res.status(400).json({ error: 'firmName is required' });
        }
        if (!area || !area.toString().trim()) {
            return res.status(400).json({ error: 'area is required' });
        }

        const image = req.file ? req.file.filename : undefined;

        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const firm = new Firm({
            firmName: firmNameValue,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id,
        });

        await firm.save();

        return res.status(201).json({ message: 'Firm added successfully', firm });

    } catch (error) {
        console.error('addFirm error:', error);
        // Handle mongoose validation errors explicitly
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Unprotected test helper: create a firm without vendor (useful for testing request format)
const testAddFirm = async (req, res) => {
    try {
        console.log('testAddFirm received body:', req.body);
        console.log('testAddFirm received file:', req.file);

        const firmNameValue = (req.body.firmName || req.body.fireName || '').toString().trim();
        const area = req.body.area;
        const category = req.body.category;
        const region = req.body.region;
        const offer = req.body.offer;

        if (!firmNameValue) {
            return res.status(400).json({ error: 'firmName is required' });
        }
        if (!area || !area.toString().trim()) {
            return res.status(400).json({ error: 'area is required' });
        }

        const image = req.file ? req.file.filename : undefined;

        const firm = new Firm({
            firmName: firmNameValue,
            area,
            category,
            region,
            offer,
            image,
        });

        await firm.save();
        return res.status(201).json({ message: 'Firm (test) added successfully', firm });
    } catch (error) {
        console.error('testAddFirm error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteFirmById = async (req, res) => {
    try {
        const firmId = req.params.firmId;

        const deletedFirm = await Firm.findByIdAndDelete(firmId);

        if (!deletedFirm) {
            return res.status(404).json({ error: 'No Firm found' });
        }

        return res.status(200).json({ message: 'Firm deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addFirm: [upload.single('image'), addFirm],
    testAddFirm: [upload.single('image'), testAddFirm],
    deleteFirmById: deleteFirmById,
};
   

