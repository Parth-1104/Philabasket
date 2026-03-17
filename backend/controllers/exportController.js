import orderModel from "../models/orderModel.js";
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

const exportOrders = async (req, res) => {
    try {
        const { format, dateRange, sortBy, sortOrder, statuses } = req.body;

        // 1. Build Query
        let query = {};
        if (dateRange?.start && dateRange?.end) {
            const start = new Date(dateRange.start).setHours(0, 0, 0, 0);
            const end = new Date(dateRange.end).setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        // --- UPDATED STATUS LOGIC ---
        if (statuses && statuses.length > 0) {
            let queryStatuses = [...statuses];
            // If "Complete" is selected but "Delivered" is missing, add it for the DB query
            if (queryStatuses.includes('Complete') && !queryStatuses.includes('Delivered')) {
                queryStatuses.push('Delivered');
            }
            query.status = { $in: queryStatuses };
        }

        // 2. Fetch Data
        const sortDirection = sortOrder === 'Descending' ? -1 : 1;
        // Map frontend SortBy to backend fields
        const sortField = sortBy === 'Order ID' ? 'orderNo' : 'date';
        
        const orders = await orderModel.find(query)
            .sort({ [sortField]: sortDirection });

        // 3. Transformation Logic
        const reportData = [];
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item, index) => {
                    reportData.push({
                        order: order.orderNo || order._id.toString().slice(-6).toUpperCase(),
                        date: new Date(order.date).toLocaleDateString('en-IN'),
                        first: order.address?.firstName || 'N/A',
                        last: order.address?.lastName || '',
                        itemNo: index + 1,
                        itemName: item.name || 'Unknown Specimen',
                        quantity: item.quantity || 0,
                        itemCost: item.price || 0,
                        totalRow: (item.price || 0) * (item.quantity || 0),
                        status: order.status
                    });
                });
            }
        });

        // 4. Format Selection Logic
        if (format === 'XLSX') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Line Item Registry');

            worksheet.columns = [
                { header: 'Registry Date', key: 'date', width: 15 },
                { header: 'Order No.', key: 'order', width: 15 },
                { header: 'First Name', key: 'first', width: 15 },
                { header: 'Last Name', key: 'last', width: 15 },
                { header: 'Item #', key: 'itemNo', width: 10 },
                { header: 'Specimen Name', key: 'itemName', width: 50 },
                { header: 'Qty', key: 'quantity', width: 10 },
                { header: 'Unit Price', key: 'itemCost', width: 15 },
                { header: 'Total Value', key: 'totalRow', width: 15 },
                { header: 'Current Status', key: 'status', width: 15 }
            ];

            worksheet.addRows(reportData);

            // Styling Header
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BC002D' } }; // Brand Red
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // Set Number Formats for Currency columns
            worksheet.getColumn('itemCost').numFmt = '"₹"#,##0.00';
            worksheet.getColumn('totalRow').numFmt = '"₹"#,##0.00';

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=PhilaBasket_Registry_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            return res.end();
        }

        // --- Standard CSV/JSON Fallbacks ---
        if (format === 'JSON') return res.status(200).json(reportData);
        if (format === 'CSV') {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(reportData);
            res.header('Content-Type', 'text/csv');
            res.attachment(`registry-export-${Date.now()}.csv`);
            return res.send(csv);
        }

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: "Internal Registry Export Error" });
    }
};

export { exportOrders };