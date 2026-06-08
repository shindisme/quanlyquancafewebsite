import prisma from '../../config/prisma.js';
import { DiscountType } from '../../generated/prisma/index.js';

export const couponService = {
  async getAll() {
    return await prisma.coupon.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: 'desc' }
    });
  },

  async getValidCoupon(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code }
    });
    if (!coupon || coupon.deletedAt) return null;
    if (!coupon.isActive) return null;

    const now = new Date();
    if (now < coupon.startDate) return null;
    if (coupon.endDate && now > coupon.endDate) return null;
    if (coupon.limit && coupon.usedCount >= coupon.limit) return null;

    return coupon;
  },

  async create(data: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minValue?: number;
    maxDiscount?: number;
    limit?: number;
    isActive?: boolean;
    startDate: Date;
    endDate?: Date;
  }) {
    return await prisma.coupon.create({
      data: {
        ...data,
        minValue: data.minValue || 0,
        isActive: data.isActive ?? true
      }
    });
  },

  async update(id: string, data: any) {
    return await prisma.coupon.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return await prisma.coupon.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
};
