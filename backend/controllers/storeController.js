import asyncHandler from '../middleware/asyncHandler.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';

// @desc    Fetch all stores (public)
// @route   GET /api/stores
// @access  Public
const getAllStores = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  let query = { isActive: true }; // Only active stores

  // Dynamically apply pincode filter if it's provided in the query
  if (req.query.pincode) {
    query['address.pinCode'] = req.query.pincode;
  }
  // If req.query.pincode is NOT provided, no pincode filter is applied,
  // allowing general browsing to see all active stores.

  const keyword = req.query.search
    ? {
        name: {
          $regex: req.query.search,
          $options: 'i',
        },
      }
    : {};

  const finalQuery = { ...query, ...keyword };

  const count = await Store.countDocuments(finalQuery);
  const stores = await Store.find(finalQuery)
    .populate('owner', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ stores, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch a single store by ID with its products (public)
// @route   GET /api/stores/:id
// @access  Public
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (store && store.isActive) {
    // Products for a specific store are fetched via the productRoutes with a store filter
    // This endpoint will just return the store details.
    res.json(store);
  } else {
    res.status(404);
    throw new Error('Store not found or is inactive');
  }
});

// @desc    Update store details (vendor)
// @route   PUT /api/stores/:id
// @access  Private/Vendor
const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  // Authorization check: Ensure the vendor owns this store
  if (store.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this store.');
  }

  // Update fields from request body
  const { name, description, category, address, phone, email, logo, isActive } = req.body;
  store.name = name || store.name;
  store.description = description || store.description;
  store.category = category || store.category;
  store.phone = phone || store.phone;
  store.email = email || store.email;
  store.logo = logo || store.logo;
  store.isActive = isActive !== undefined ? isActive : store.isActive;

  if (address) {
    store.address = { ...store.address, ...address };
  }

  const updatedStore = await store.save();
  res.json(updatedStore);
});

export { getAllStores, getStoreById, updateStore };