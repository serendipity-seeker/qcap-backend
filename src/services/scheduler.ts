import { CronJob } from 'cron';
import axios from 'axios';
import prisma from '../config/database';

const QX_MONITOR_ADDRESS = {
  QCAP: 'DOBSPYBBGURSFDIYSODQCKQUDAACBDYKDMQQWHVPGHBBNARNJNEAZHDDDJCD',
  QX: 'IHRJDIKLNQEWKFELXLGFBCGTRHRCYWAVPACHTSKRRGTYSHJRLVXSHVOBMEHE',
  QTRY: 'NCMYDYRCCFGCDFACMLUSVLTDVXQDJDMGYHDTVYXECAHRPTBTBCVHQZLAORIL',
  QVAULT: 'EZJMOWKYBSEDYCZFMUKXYESBUHFBMPXDETROJVQOFHLJPIHVSNXYWYZEEQQB',
};

const RPC_URL = 'https://rpc.qubic.org/v1';

export const startWeeklyDataFetch = () => {
  // Schedule for every Wednesday at 12:30 PM UTC
  const job = new CronJob('30 12 * * 3', async () => {
    try {
      const response = await axios.get(`${RPC_URL}/tick-info`);
      const { epoch } = response.data.tickInfo;
      console.log(`Starting data fetch for epoch: ${epoch}`);

      for (const [key, address] of Object.entries(QX_MONITOR_ADDRESS)) {
        const balanceResponse = await axios.get(`${RPC_URL}/balances/${address}`);
        const revenue = balanceResponse.data.balance.incomingAmount;

        await prisma.revenue.upsert({
          where: {
            epoch_asset: {
              epoch,
              asset: key,
            },
          },
          update: {
            revenue,
            timestamp: new Date(),
          },
          create: {
            epoch,
            asset: key,
            revenue,
          },
        });

        console.log(`Updated revenue data for ${key} at epoch ${epoch}`);
      }

      console.log('Weekly data fetch completed successfully');
    } catch (error) {
      console.error('Error in weekly data fetch:', error);
    }
  }, null, true, 'UTC');

  job.start();
  console.log('Revenue data scheduler initialized');
}; 