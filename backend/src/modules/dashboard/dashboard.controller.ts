import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getStats();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
};
