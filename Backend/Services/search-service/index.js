import express from 'express';
import { initializeIndices } from './services/indexService.js';
import client from './config/elasticsearch.js';
import searchRoutes from './routes/searchRoutes.js';
import { startProductConsumer } from './kafka/consumer.js';

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

// Add search routes
app.use('/api/search', searchRoutes);

app.get('/health', async (req, res) => {
  try {
    const health = await client.cluster.health({});
    res.status(200).json({ status: 'ok', elasticsearch: health });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Elasticsearch connection failed', error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Search service is running on port ${PORT}`);
  try {
    // Ping Elasticsearch
    const ping = await client.ping();
    if (ping) {
      console.log('Connected to Elasticsearch successfully.');
      // Initialize mappings/indices
      await initializeIndices();
      
      // Start Kafka Consumer
      await startProductConsumer();
    }
  } catch (error) {
    console.error('Failed to connect to Elasticsearch:', error);
  }
});
// restart nodemon
// restart nodemon
