const Order = require('../models/orderModel');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');

exports.exportOrders = async (req, res) => {
  const { format, filterBy, dateRange, statuses, sortBy, sortOrder } = req.body;

  // 1. Build dynamic MongoDB query
  let query = {};
  if (statuses && statuses.length > 0) query.status = { $in: statuses };
  
  // Dynamic Date Filter (Order Date, Modification, etc.)
  const fieldMap = { 'Order Date': 'createdAt', 'Paid Date': 'paidAt', 'Completed Date': 'completedAt' };
  const dbField = fieldMap[filterBy] || 'createdAt';
  
  if (dateRange.start || dateRange.end) {
    query[dbField] = {};
    if (dateRange.start) query[dbField].$gte = new Date(dateRange.start);
    if (dateRange.end) query[dbField].$lte = new Date(dateRange.end);
  }

  // 2. Fetch and Sort
  const sortDirection = sortOrder === 'Descending' ? -1 : 1;
  const orders = await Order.find(query).sort({ [sortBy === 'Order ID' ? '_id' : 'createdAt']: sortDirection }).lean();

  // 3. Format data based on request type
  const flatData = orders.map(o => ({
    'Order ID': o._id,
    'Customer': o.customerName,
    'Status': o.status,
    'Amount': o.totalAmount,
    'Date': o.createdAt.toLocaleDateString()
  }));

  if (format === 'CSV') {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(flatData);
    res.header('Content-Type', 'text/csv');
    return res.send(csv);
  } 
  
  if (format === 'XLSX') {
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  }

  res.status(400).send('Format not supported');
};