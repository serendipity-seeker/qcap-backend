import { CronJob } from 'cron';
import axios, { AxiosError } from 'axios';
import prisma from '../config/database';

const QX_MONITOR_ADDRESS = {
  QCAP: 'DOBSPYBBGURSFDIYSODQCKQUDAACBDYKDMQQWHVPGHBBNARNJNEAZHDDDJCD',
  QX: 'IHRJDIKLNQEWKFELXLGFBCGTRHRCYWAVPACHTSKRRGTYSHJRLVXSHVOBMEHE',
  QTRY: 'NCMYDYRCCFGCDFACMLUSVLTDVXQDJDMGYHDTVYXECAHRPTBTBCVHQZLAORIL',
  QVAULT: 'EZJMOWKYBSEDYCZFMUKXYESBUHFBMPXDETROJVQOFHLJPIHVSNXYWYZEEQQB',
};

const RPC_URL = 'https://rpc.qubic.org/v1';

const api = axios.create({
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation. Attempts remaining: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay);
    }
    throw error;
  }
}

async function calculateRevenue(currentBalance: number, epoch: number, asset: string): Promise<number> {
  try {
    const previousEpochData = await prisma.revenue.findFirst({
      where: {
        epoch: {
          lt: epoch,
        },
        asset: asset,
      },
      orderBy: {
        epoch: 'desc',
      },
    });

    if (!previousEpochData) {
      return currentBalance;
    }

    return currentBalance - previousEpochData.balance;
  } catch (error) {
    console.error(`Error calculating revenue for ${asset} at epoch ${epoch}:`, error);
    return 0;
  }
}

async function fetchTickInfo() {
  return retryOperation(async () => {
    const response = await api.get(`${RPC_URL}/tick-info`);
    return response.data.tickInfo;
  });
}

async function fetchBalance(address: string) {
  return retryOperation(async () => {
    const response = await api.get(`${RPC_URL}/balances/${address}`);
    return response.data.balance;
  });
}

export const startWeeklyDataFetch = () => {
  const job = new CronJob(
    '30 12 * * 3',
    async () => {
      try {
        console.log('Starting scheduled data fetch at:', new Date().toISOString());

        const tickInfo = await fetchTickInfo();
        const { epoch } = tickInfo;
        console.log(`Fetching data for epoch: ${epoch}`);

        for (const [key, address] of Object.entries(QX_MONITOR_ADDRESS)) {
          try {
            console.log(`Processing ${key} at address ${address}`);

            const balance = await fetchBalance(address);
            const currentBalance = parseInt(balance.balance) || 0;

            const revenue = await calculateRevenue(currentBalance, epoch, key);

            await prisma.revenue.upsert({
              where: {
                epoch_asset: {
                  epoch: parseInt(epoch),
                  asset: key,
                },
              },
              update: {
                balance: currentBalance,
                revenue: revenue,
                timestamp: new Date(),
              },
              create: {
                epoch: parseInt(epoch),
                asset: key,
                balance: currentBalance,
                revenue: revenue,
              },
            });

            console.log(`Updated ${key} - Balance: ${currentBalance}, Revenue: ${revenue}`);
          } catch (error) {
            console.error(`Error processing ${key}:`, error);
            // Continue with next asset even if one fails
            continue;
          }
        }

        console.log('Data fetch completed successfully');
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Network error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data,
          });
        } else {
          console.error('Error in data fetch:', error);
        }
      }
    },
    null,
    true,
    'UTC'
  );

  job.start();
  console.log('Revenue data scheduler initialized');
};
