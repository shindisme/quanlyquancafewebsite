import { Router } from 'express';
import tableRoutes from './modules/table/table.route.js';
import areaRoutes from './modules/area/area.route.js';
import authRoutes from './modules/auth/auth.route.js';
import categoryRoutes from './modules/category/category.route.js';
import userRoutes from './modules/user/user.route.js';
import productRoutes from './modules/product/product.route.js';
import orderRoutes from './modules/order/order.route.js';
import invoiceRoutes from './modules/invoice/invoice.route.js';
import paymentRoutes from './modules/payment/payment.route.js';
import couponRoutes from './modules/coupon/coupon.route.js';
import uploadRoutes from './modules/upload/upload.route.js';
import toppingRoutes from './modules/topping/topping.route.js';
import toppingGroupRoutes from './modules/topping-group/topping-group.route.js';
import dashboardRoutes from './modules/dashboard/dashboard.route.js';

const router = Router();

// main router
router.get('/', (req, res) => {
    res.send('Hello world!!!');
})

// /api/v1
router.use('/areas', areaRoutes);
router.use('/tables', tableRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/upload', uploadRoutes);
router.use('/toppings', toppingRoutes);
router.use('/topping-groups', toppingGroupRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
