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
      console.log('Starting scheduled data fetch at:', new Date().toISOString());
      
      const response = await axios.get(`${RPC_URL}/tick-info`);
      const { epoch } = response.data.tickInfo;
      console.log(`Fetching data for epoch: ${epoch}`);

      for (const [key, address] of Object.entries(QX_MONITOR_ADDRESS)) {
        console.log(`Processing ${key} at address ${address}`);
        
        const balanceResponse = await axios.get(`${RPC_URL}/balances/${address}`);
        const revenue = parseInt(balanceResponse.data.balance.incomingAmount) || 0;

        await prisma.revenue.upsert({
          where: {
            epoch_asset: {
              epoch: parseInt(epoch),
              asset: key,
            },
          },
          update: {
            revenue,
            timestamp: new Date(),
          },
          create: {
            epoch: parseInt(epoch),
            asset: key,
            revenue,
          },
        });

        console.log(`Updated revenue data for ${key}: ${revenue}`);
      }

      console.log('Data fetch completed successfully');
    } catch (error: any) {
      console.error('Error in data fetch:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  }, null, true, 'UTC');

  job.start();
  console.log('Revenue data scheduler initialized');
}; 