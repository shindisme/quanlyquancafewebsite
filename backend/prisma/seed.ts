import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcrypt';
import { UserRole, InvoiceStatus, OrderStatus, DiscountType, PaymentMethod, PaymentStatus } from '../src/generated/prisma/index.js';

async function main() {
  console.log('🌱 Đang bắt đầu seed dữ liệu cho quán Cafe...');

  // 1. SEED USERS (Nhân viên & Quản lý)
  console.log('👤 Đang tạo danh sách Nhân viên & Quản trị viên...');
  const defaultPassword = await bcrypt.hash('123123', 10);

  const usersData = [
    {
      username: 'admin',
      email: 'admin@gmail.com',
      name: 'Nguyễn Tiến Dũng (Admin)',
      role: UserRole.ADMIN,
      password: defaultPassword,
    },
    {
      username: 'admin2',
      email: 'admin2@gmail.com',
      name: 'Trần Quản Lý (Admin)',
      role: UserRole.ADMIN,
      password: defaultPassword,
    },
    {
      username: 'staff1',
      email: 'staff1@gmail.com',
      name: 'Nguyễn Văn An (Barista)',
      role: UserRole.STAFF,
      password: defaultPassword,
    },
    {
      username: 'staff2',
      email: 'staff2@gmail.com',
      name: 'Trần Thị Mai (Thu Ngân)',
      role: UserRole.STAFF,
      password: defaultPassword,
    },
    {
      username: 'staff3',
      email: 'staff3@gmail.com',
      name: 'Lê Hoàng Long (Phục Vụ)',
      role: UserRole.STAFF,
      password: defaultPassword,
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, role: u.role, password: u.password },
      create: u,
    });
    createdUsers[u.username] = user;
  }
  console.log(`✅ Đã seed ${Object.keys(createdUsers).length} tài khoản người dùng.`);

  // 2. SEED KHU VỰC (AREAS)
  console.log('🏡 Đang tạo khu vực (Tầng 1, Tầng 2, Ban công / Sân thượng)...');
  const areasData = [
    { name: 'Tầng 1 - Sảnh Máy Lạnh' },
    { name: 'Tầng 2 - Không Gian Làm Việc' },
    { name: 'Sân Thượng & Ban Công Chill' },
  ];

  const createdAreas: any[] = [];
  for (const a of areasData) {
    let area = await prisma.area.findFirst({ where: { name: a.name, deletedAt: null } });
    if (!area) {
      area = await prisma.area.create({ data: a });
    }
    createdAreas.push(area);
  }
  console.log(`✅ Đã seed ${createdAreas.length} khu vực.`);

  // 3. SEED BÀN (TABLES)
  console.log('🪑 Đang tạo bàn cho từng khu vực...');
  const tablesData = [
    // Tầng 1
    { name: 'Bàn T1.01', code: 'T1-01', areaId: createdAreas[0].id, isBooked: false },
    { name: 'Bàn T1.02', code: 'T1-02', areaId: createdAreas[0].id, isBooked: false },
    { name: 'Bàn T1.03 (Đang dùng)', code: 'T1-03', areaId: createdAreas[0].id, isBooked: true },
    { name: 'Bàn T1.04', code: 'T1-04', areaId: createdAreas[0].id, isBooked: false },
    { name: 'Bàn T1.05', code: 'T1-05', areaId: createdAreas[0].id, isBooked: false },
    // Tầng 2
    { name: 'Bàn T2.01', code: 'T2-01', areaId: createdAreas[1].id, isBooked: false },
    { name: 'Bàn T2.02', code: 'T2-02', areaId: createdAreas[1].id, isBooked: false },
    { name: 'Bàn T2.03', code: 'T2-03', areaId: createdAreas[1].id, isBooked: false },
    { name: 'Bàn T2.04', code: 'T2-04', areaId: createdAreas[1].id, isBooked: false },
    // Ban công / Sân thượng
    { name: 'Bàn Ban Công 1 (Đang dùng)', code: 'BC-01', areaId: createdAreas[2].id, isBooked: true },
    { name: 'Bàn Ban Công 2', code: 'BC-02', areaId: createdAreas[2].id, isBooked: false },
    { name: 'Bàn Sân Thượng 1', code: 'ST-01', areaId: createdAreas[2].id, isBooked: false },
    { name: 'Bàn Sân Thượng 2', code: 'ST-02', areaId: createdAreas[2].id, isBooked: false },
  ];

  const createdTables: Record<string, any> = {};
  for (const t of tablesData) {
    const table = await prisma.table.upsert({
      where: { code: t.code },
      update: { name: t.name, areaId: t.areaId, isBooked: t.isBooked },
      create: t,
    });
    createdTables[t.code] = table;
  }
  console.log(`✅ Đã seed ${Object.keys(createdTables).length} bàn.`);

  // 4. SEED DANH MỤC (CATEGORIES)
  console.log('📂 Đang tạo danh mục sản phẩm...');
  const categoriesData = [
    { name: 'Cà Phê & Bạc Xỉu' },
    { name: 'Trà Sữa & Trà Trái Cây' },
    { name: 'Đá Xay & Sinh Tố' },
    { name: 'Bánh Ngọt & Tráng Miệng' },
  ];

  const createdCategories: Record<string, any> = {};
  for (const c of categoriesData) {
    let cat = await prisma.category.findFirst({ where: { name: c.name, deletedAt: null } });
    if (!cat) {
      cat = await prisma.category.create({ data: c });
    }
    createdCategories[c.name] = cat;
  }
  console.log(`✅ Đã seed ${Object.keys(createdCategories).length} danh mục.`);

  // 5. SEED TOPPING THEO DANH MỤC
  console.log('🧋 Đang tạo Topping cho từng danh mục...');
  const toppingsData = [
    // Cho Cà Phê
    { categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id, name: 'Thạch Cà Phê', price: 6000 },
    { categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id, name: 'Shot Espresso Thêm', price: 10000 },
    { categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id, name: 'Kem Béo Cốt Dừa', price: 8000 },
    // Cho Trà Sữa & Trà Trái Cây
    { categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id, name: 'Trân Châu Đen Hoàng Gia', price: 8000 },
    { categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id, name: 'Trân Châu Trắng 3Q', price: 10000 },
    { categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id, name: 'Thạch Nha Đam Đào', price: 8000 },
    { categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id, name: 'Kem Cheese Macchiato', price: 12000 },
    { categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id, name: 'Pudding Trứng Vàng', price: 9000 },
    // Cho Đá Xay & Sinh Tố
    { categoryId: createdCategories['Đá Xay & Sinh Tố'].id, name: 'Kem Tươi Whipping', price: 10000 },
    { categoryId: createdCategories['Đá Xay & Sinh Tố'].id, name: 'Sốt Caramel Béo', price: 6000 },
  ];

  const createdToppings: Record<string, any> = {};
  for (const top of toppingsData) {
    const topping = await prisma.topping.upsert({
      where: {
        categoryId_name: {
          categoryId: top.categoryId,
          name: top.name,
        },
      },
      update: { price: top.price, isActive: true },
      create: top,
    });
    createdToppings[top.name] = topping;
  }
  console.log(`✅ Đã seed ${Object.keys(createdToppings).length} loại topping.`);

  // 6. SEED SẢN PHẨM & SIZES
  console.log('☕ Đang tạo sản phẩm và cấu hình size...');
  const productsData = [
    // Cà phê
    {
      categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id,
      name: 'Cà Phê Đen Đá',
      price: 25000,
      description: 'Cà phê Robusta mộc pha phin đậm đà chuẩn vị truyền thống.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 5000 },
      ],
    },
    {
      categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id,
      name: 'Cà Phê Sữa Đá Sài Gòn',
      price: 29000,
      description: 'Hương vị cà phê nồng nàn quyện cùng sữa đặc béo ngậy.',
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 5000 },
      ],
    },
    {
      categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id,
      name: 'Bạc Xỉu 3 Tầng Thơm Ngậy',
      price: 35000,
      description: 'Sự kết hợp tinh tế giữa lớp sữa tươi, sữa đặc và cà phê sánh mịn.',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 5000 },
      ],
    },
    {
      categoryId: createdCategories['Cà Phê & Bạc Xỉu'].id,
      name: 'Cà Phê Muối Kem Béo',
      price: 35000,
      description: 'Vị cà phê hòa quyện cùng lớp kem muối mặn mà độc đáo khó quên.',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 5000 },
      ],
    },
    // Trà Sữa & Trà Trái Cây
    {
      categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id,
      name: 'Trà Đào Cam Sả Tươi',
      price: 39000,
      description: 'Hương thơm nồng ấm từ sả, vị thanh mát từ đào giòn và cam tươi mọng nước.',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 6000 },
      ],
    },
    {
      categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id,
      name: 'Trà Vải Hoa Hồng Hoàng Gia',
      price: 42000,
      description: 'Vị ngọt thanh dịu mát từ trái vải kết hợp cùng hương thơm hoa hồng tinh khiết.',
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 6000 },
      ],
    },
    {
      categoryId: createdCategories['Trà Sữa & Trà Trái Cây'].id,
      name: 'Trà Sữa Oolong Nướng',
      price: 40000,
      description: 'Trà Oolong ủ hương nướng thơm đậm đà hòa cùng sữa tươi béo thơm chuẩn vị Đài Loan.',
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 7000 },
      ],
    },
    // Đá Xay & Sinh Tố
    {
      categoryId: createdCategories['Đá Xay & Sinh Tố'].id,
      name: 'Matcha Đá Xay Kem Tuyết',
      price: 48000,
      description: 'Bột trà xanh Uji Nhật Bản nguyên chất xay mịn phủ lớp kem whipping mát lạnh.',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 8000 },
      ],
    },
    {
      categoryId: createdCategories['Đá Xay & Sinh Tố'].id,
      name: 'Cà Phê Cốt Dừa Đá Xay',
      price: 49000,
      description: 'Cốt dừa Bến Tre thơm béo xay tuyết mịn rưới cà phê espresso hảo hạng.',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 8000 },
      ],
    },
    {
      categoryId: createdCategories['Đá Xay & Sinh Tố'].id,
      name: 'Sinh Tố Bơ Sáp Đắk Lắk',
      price: 45000,
      description: 'Bơ sáp loại 1 dẻo quánh xay cùng sữa tươi tạo nên thức uống dinh dưỡng tuyệt vời.',
      image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80',
      sizes: [
        { sizeName: 'M', extraPrice: 0 },
        { sizeName: 'L', extraPrice: 7000 },
      ],
    },
    // Bánh Ngọt
    {
      categoryId: createdCategories['Bánh Ngọt & Tráng Miệng'].id,
      name: 'Bánh Tiramisu Ý Truyền Thống',
      price: 38000,
      description: 'Bánh mềm tan đượm hương cà phê và phô mai mascarpone béo ngậy.',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
      sizes: [],
    },
    {
      categoryId: createdCategories['Bánh Ngọt & Tráng Miệng'].id,
      name: 'Bánh Cheesecake Chanh Dây',
      price: 42000,
      description: 'Đế bánh quy giòn thơm, lớp phô mai béo mịn kết hợp sốt chanh dây chua ngọt hài hòa.',
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
      sizes: [],
    },
    {
      categoryId: createdCategories['Bánh Ngọt & Tráng Miệng'].id,
      name: 'Bánh Croissant Bơ Tỏi Nướng',
      price: 28000,
      description: 'Bánh sừng bò ngàn lớp nướng vàng ruộm, thơm lừng bơ Pháp và tỏi thơm.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
      sizes: [],
    },
  ];

  const createdProducts: Record<string, any> = {};
  const createdSizes: Record<string, Record<string, any>> = {};

  for (const p of productsData) {
    let product = await prisma.product.findFirst({
      where: { categoryId: p.categoryId, name: p.name, deletedAt: null },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          categoryId: p.categoryId,
          name: p.name,
          price: p.price,
          description: p.description,
          image: p.image,
          isAvailable: true,
        },
      });
    }

    createdProducts[p.name] = product;
    createdSizes[p.name] = {};

    for (const s of p.sizes) {
      const size = await prisma.size.upsert({
        where: {
          productId_sizeName: {
            productId: product.id,
            sizeName: s.sizeName,
          },
        },
        update: { extraPrice: s.extraPrice },
        create: {
          productId: product.id,
          sizeName: s.sizeName,
          extraPrice: s.extraPrice,
        },
      });
      createdSizes[p.name][s.sizeName] = size;
    }
  }
  console.log(`✅ Đã seed ${Object.keys(createdProducts).length} sản phẩm và đầy đủ các size.`);

  // 7. SEED KHUYẾN MÃI (COUPONS)
  console.log('🎟️ Đang tạo mã khuyến mãi...');
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const couponsData = [
    {
      code: 'COFFEE10',
      discountType: DiscountType.PERCENT,
      discountValue: 10,
      minValue: 50000,
      maxDiscount: 25000,
      limit: 100,
      usedCount: 12,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    },
    {
      code: 'GIAM20K',
      discountType: DiscountType.VALUE,
      discountValue: 20000,
      minValue: 100000,
      maxDiscount: 20000,
      limit: 50,
      usedCount: 8,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    },
    {
      code: 'WELCOME',
      discountType: DiscountType.PERCENT,
      discountValue: 20,
      minValue: 0,
      maxDiscount: 30000,
      limit: 200,
      usedCount: 25,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    },
    {
      code: 'VIPCAFE',
      discountType: DiscountType.PERCENT,
      discountValue: 15,
      minValue: 150000,
      maxDiscount: 50000,
      limit: 500,
      usedCount: 30,
      isActive: true,
      startDate: now,
      endDate: nextMonth,
    },
  ];

  const createdCoupons: Record<string, any> = {};
  for (const c of couponsData) {
    const coupon = await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    createdCoupons[c.code] = coupon;
  }
  console.log(`✅ Đã seed ${Object.keys(createdCoupons).length} mã giảm giá.`);

  // 8. SEED HÓA ĐƠN, ĐƠN HÀNG, CHI TIẾT & THANH TOÁN MẪU
  console.log('🧾 Đang tạo hóa đơn & đơn hàng mẫu...');

  // Hóa đơn 1: Bàn T1-01 - Đã thanh toán tiền mặt (PAID - CASH)
  const invoice1 = await prisma.invoice.upsert({
    where: { code: 'INV-260901' },
    update: {},
    create: {
      code: 'INV-260901',
      tableId: createdTables['T1-01'].id,
      userId: createdUsers['staff1'].id,
      couponId: createdCoupons['COFFEE10'].id,
      totalAmount: 118000,
      discountAmount: 11800,
      finalAmount: 106200,
      status: InvoiceStatus.PAID,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
      paidAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
  });

  const order1 = await prisma.order.upsert({
    where: { code: 'ORD-260901-1' },
    update: {},
    create: {
      code: 'ORD-260901-1',
      invoiceId: invoice1.id,
      subTotal: 118000,
      status: OrderStatus.COMPLETED,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // Món 1: 2 Bạc Xỉu Size L + Thạch cà phê
  const od1 = await prisma.orderDetail.create({
    data: {
      orderId: order1.id,
      productId: createdProducts['Bạc Xỉu 3 Tầng Thơm Ngậy'].id,
      sizeId: createdSizes['Bạc Xỉu 3 Tầng Thơm Ngậy']['L'].id,
      quantity: 2,
      price: 40000, // 35k + 5k size L
      note: 'Ít ngọt, nhiều đá',
      orderDetailsToppings: {
        create: [
          {
            toppingId: createdToppings['Thạch Cà Phê'].id,
            price: 6000,
          },
        ],
      },
    },
  });

  // Món 2: 1 Bánh Tiramisu
  await prisma.orderDetail.create({
    data: {
      orderId: order1.id,
      productId: createdProducts['Bánh Tiramisu Ý Truyền Thống'].id,
      quantity: 1,
      price: 38000,
      note: 'Ăn tại chỗ',
    },
  });

  // Payment tiền mặt
  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      method: PaymentMethod.CASH,
      amount: 106200,
      status: PaymentStatus.SUCCESS,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
  });

  // Hóa đơn 2: Bàn T2-02 - Đã thanh toán VNPAY (PAID - VNPAY)
  const invoice2 = await prisma.invoice.upsert({
    where: { code: 'INV-260902' },
    update: {},
    create: {
      code: 'INV-260902',
      tableId: createdTables['T2-02'].id,
      userId: createdUsers['staff2'].id,
      couponId: createdCoupons['GIAM20K'].id,
      totalAmount: 153000,
      discountAmount: 20000,
      finalAmount: 133000,
      status: InvoiceStatus.PAID,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    },
  });

  const order2 = await prisma.order.upsert({
    where: { code: 'ORD-260902-1' },
    update: {},
    create: {
      code: 'ORD-260902-1',
      invoiceId: invoice2.id,
      subTotal: 153000,
      status: OrderStatus.COMPLETED,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  });

  // Món: Trà Đào Cam Sả Size L + Thạch Nha Đam
  await prisma.orderDetail.create({
    data: {
      orderId: order2.id,
      productId: createdProducts['Trà Đào Cam Sả Tươi'].id,
      sizeId: createdSizes['Trà Đào Cam Sả Tươi']['L'].id,
      quantity: 1,
      price: 45000,
      orderDetailsToppings: {
        create: [
          {
            toppingId: createdToppings['Thạch Nha Đam Đào'].id,
            price: 8000,
          },
        ],
      },
    },
  });

  // Món: Matcha Đá Xay Size L + Kem Whipping
  await prisma.orderDetail.create({
    data: {
      orderId: order2.id,
      productId: createdProducts['Matcha Đá Xay Kem Tuyết'].id,
      sizeId: createdSizes['Matcha Đá Xay Kem Tuyết']['L'].id,
      quantity: 1,
      price: 56000,
      orderDetailsToppings: {
        create: [
          {
            toppingId: createdToppings['Kem Tươi Whipping'].id,
            price: 10000,
          },
        ],
      },
    },
  });

  // Món: Bánh Cheesecake
  await prisma.orderDetail.create({
    data: {
      orderId: order2.id,
      productId: createdProducts['Bánh Cheesecake Chanh Dây'].id,
      quantity: 1,
      price: 42000,
    },
  });

  // Payment VNPAY
  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      method: PaymentMethod.VNPAY,
      transactionId: 'VNPAY-20260908-98124',
      amount: 133000,
      status: PaymentStatus.SUCCESS,
      createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    },
  });

  // Hóa đơn 3: Bàn Ban Công BC-01 - Đang phục vụ (UNPAID, Order: CONFIRMED)
  const invoice3 = await prisma.invoice.upsert({
    where: { code: 'INV-260903' },
    update: {},
    create: {
      code: 'INV-260903',
      tableId: createdTables['BC-01'].id,
      userId: createdUsers['staff1'].id,
      totalAmount: 147000,
      discountAmount: 0,
      finalAmount: 147000,
      status: InvoiceStatus.UNPAID,
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 phút trước
    },
  });

  const order3 = await prisma.order.upsert({
    where: { code: 'ORD-260903-1' },
    update: {},
    create: {
      code: 'ORD-260903-1',
      invoiceId: invoice3.id,
      subTotal: 147000,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
  });

  // 2 Cà phê muối Size M
  await prisma.orderDetail.create({
    data: {
      orderId: order3.id,
      productId: createdProducts['Cà Phê Muối Kem Béo'].id,
      sizeId: createdSizes['Cà Phê Muối Kem Béo']['M'].id,
      quantity: 2,
      price: 35000,
    },
  });

  // 1 Trà Sữa Oolong Nướng Size L + 2 Topping (Trân châu đen + Kem cheese)
  await prisma.orderDetail.create({
    data: {
      orderId: order3.id,
      productId: createdProducts['Trà Sữa Oolong Nướng'].id,
      sizeId: createdSizes['Trà Sữa Oolong Nướng']['L'].id,
      quantity: 1,
      price: 47000,
      note: '70% đường, 50% đá',
      orderDetailsToppings: {
        create: [
          {
            toppingId: createdToppings['Trân Châu Đen Hoàng Gia'].id,
            price: 8000,
          },
          {
            toppingId: createdToppings['Kem Cheese Macchiato'].id,
            price: 12000,
          },
        ],
      },
    },
  });

  // Hóa đơn 4: Bàn T1-03 - Mới gọi món (UNPAID, Order: PENDING)
  const invoice4 = await prisma.invoice.upsert({
    where: { code: 'INV-260904' },
    update: {},
    create: {
      code: 'INV-260904',
      tableId: createdTables['T1-03'].id,
      userId: createdUsers['staff3'].id,
      totalAmount: 57000,
      discountAmount: 0,
      finalAmount: 57000,
      status: InvoiceStatus.UNPAID,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 phút trước
    },
  });

  const order4 = await prisma.order.upsert({
    where: { code: 'ORD-260904-1' },
    update: {},
    create: {
      code: 'ORD-260904-1',
      invoiceId: invoice4.id,
      subTotal: 57000,
      status: OrderStatus.PENDING,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  await prisma.orderDetail.create({
    data: {
      orderId: order4.id,
      productId: createdProducts['Cà Phê Sữa Đá Sài Gòn'].id,
      sizeId: createdSizes['Cà Phê Sữa Đá Sài Gòn']['M'].id,
      quantity: 1,
      price: 29000,
      note: 'Nhiều sữa đặc',
    },
  });

  await prisma.orderDetail.create({
    data: {
      orderId: order4.id,
      productId: createdProducts['Bánh Croissant Bơ Tỏi Nướng'].id,
      quantity: 1,
      price: 28000,
      note: 'Hâm nóng giòn',
    },
  });

  console.log('✅ Đã seed 4 hóa đơn kèm đơn hàng, chi tiết món và thanh toán mẫu.');
  console.log('🎉 Hoàn tất toàn bộ dữ liệu mẫu!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
