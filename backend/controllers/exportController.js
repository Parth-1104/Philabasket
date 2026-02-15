import orderModel from "../models/orderModel.js";
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

const exportOrders = async (req, res) => {
    try {
        const { format, filterBy, dateRange, sortBy, sortOrder, statuses } = req.body;

        // 1. Build Query
        let query = {};
        if (dateRange?.start && dateRange?.end) {
            const start = new Date(dateRange.start).getTime();
            const end = new Date(dateRange.end).getTime();
            query.date = { $gte: start, $lte: end };
        }
        if (statuses && statuses.length > 0) {
            query.status = { $in: statuses };
        }

        // 2. Fetch Data
        const sortDirection = sortOrder === 'Descending' ? -1 : 1;
        const sortField = sortBy === 'Order ID' ? '_id' : 'date';
        
        const orders = await orderModel.find(query)
            .populate('userId', 'name email')
            .sort({ [sortField]: sortDirection });

        // 3. Format Selection Logic
        if (format === 'JSON') {
            return res.status(200).json(orders);
        }

        if (format === 'CSV') {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(orders);
            res.header('Content-Type', 'text/csv');
            res.attachment(`registry-export-${Date.now()}.csv`);
            return res.send(csv);
        }

        if (format === 'XLSX') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Orders Ledger');

            worksheet.columns = [
                { header: 'Order ID', key: 'id', width: 25 },
                { header: 'Date', key: 'date', width: 20 },
                { header: 'Customer', key: 'customer', width: 30 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Status', key: 'status', width: 15 }
            ];

            orders.forEach(order => {
                worksheet.addRow({
                    id: order._id.toString(),
                    date: new Date(order.date).toLocaleDateString(),
                    customer: order.userId?.name || order.address.firstName,
                    amount: order.amount,
                    status: order.status
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=registry.xlsx`);

            await workbook.xlsx.write(res);
            return res.end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { exportOrders };