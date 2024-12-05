import { Request, Response } from 'express';
import prisma from '../config/database';

export const getRevenues = async (req: Request, res: Response) => {
  try {
    const revenues = await prisma.revenue.findMany({
      orderBy: { timestamp: 'desc' },
    });
    res.json(revenues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenues' });
  }
};

export const getRevenueByEpochAndAsset = async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
};

export const createRevenue = async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Failed to create revenue' });
  }
};

export const updateRevenue = async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Failed to update revenue' });
  }
};

export const deleteRevenue = async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Failed to delete revenue' });
  }
}; 