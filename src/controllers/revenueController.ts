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
    if (!epoch || !asset) {
      return res.status(400).json({ error: 'Both epoch and asset are required' });
    }

    const epochNumber = parseInt(epoch);
    if (isNaN(epochNumber)) {
      return res.status(400).json({ error: 'Epoch must be a valid number' });
    }

    const revenue = await prisma.revenue.findUnique({
      where: {
        epoch_asset: {
          epoch: epochNumber,
          asset: asset.toUpperCase(),
        },
      },
    });

    if (!revenue) {
      return res.status(404).json({ 
        error: 'Revenue not found',
        details: `No revenue found for epoch ${epoch} and asset ${asset}`
      });
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
        epoch: parseInt(epoch),
        asset,
        revenue: parseInt(revenue) || 0,
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
        revenue: parseInt(revenue) || 0,
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

export const getRevenuesByEpoch = async (req: Request<{ epoch: string }>, res: Response, next: NextFunction) => {
  const { epoch } = req.params;
  try {
    const epochNumber = parseInt(epoch);
    if (isNaN(epochNumber)) {
      return res.status(400).json({ error: 'Epoch must be a valid number' });
    }

    const revenues = await prisma.revenue.findMany({
      where: {
        epoch: epochNumber,
      },
      orderBy: { asset: 'asc' },
    });
    
    if (revenues.length === 0) {
      return res.status(404).json({ 
        error: 'No revenues found',
        details: `No revenues found for epoch ${epoch}`
      });
    }
    
    res.json(revenues);
  } catch (error) {
    next(error);
  }
};

export const getRevenuesByAsset = async (req: Request<{ asset: string }>, res: Response, next: NextFunction) => {
  const { asset } = req.params;
  try {
    if (!asset) {
      return res.status(400).json({ error: 'Asset parameter is required' });
    }

    const revenues = await prisma.revenue.findMany({
      where: {
        asset: asset.toUpperCase(),
      },
      orderBy: { epoch: 'desc' },
    });
    
    if (revenues.length === 0) {
      return res.status(404).json({ 
        error: 'No revenues found',
        details: `No revenues found for asset ${asset}`
      });
    }
    
    res.json(revenues);
  } catch (error) {
    next(error);
  }
};
