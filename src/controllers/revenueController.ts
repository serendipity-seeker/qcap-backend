import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

type RevenueParams = {
  epoch: string;
  asset: string;
};

export const getRevenues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const revenues = await prisma.revenue.findMany({
      orderBy: { timestamp: 'desc' },
    });
    res.json(revenues);
  } catch (error) {
    next(error);
  }
};

export const getRevenueByEpochAndAsset = async (req: Request<RevenueParams>, res: Response, next: NextFunction) => {
  const { epoch, asset } = req.params;
  try {
    const revenue = await prisma.revenue.findUnique({
      where: {
        epoch_asset: {
          epoch: parseInt(epoch),
          asset,
        },
      },
    });
    if (!revenue) {
      return res.status(404).json({ error: 'Revenue not found' });
    }
    res.json(revenue);
  } catch (error) {
    next(error);
  }
};

export const createRevenue = async (req: Request, res: Response, next: NextFunction) => {
  const { epoch, asset, revenue } = req.body;
  try {
    const newRevenue = await prisma.revenue.create({
      data: {
        epoch,
        asset,
        revenue,
      },
    });
    res.status(201).json(newRevenue);
  } catch (error) {
    next(error);
  }
};

export const updateRevenue = async (req: Request<RevenueParams>, res: Response, next: NextFunction) => {
  const { epoch, asset } = req.params;
  const { revenue } = req.body;
  try {
    const updatedRevenue = await prisma.revenue.update({
      where: {
        epoch_asset: {
          epoch: parseInt(epoch),
          asset,
        },
      },
      data: {
        revenue,
        timestamp: new Date(),
      },
    });
    res.json(updatedRevenue);
  } catch (error) {
    next(error);
  }
};

export const deleteRevenue = async (req: Request<RevenueParams>, res: Response, next: NextFunction) => {
  const { epoch, asset } = req.params;
  try {
    await prisma.revenue.delete({
      where: {
        epoch_asset: {
          epoch: parseInt(epoch),
          asset,
        },
      },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
