import mongoose from 'mongoose';
import Partner from './models/Partner.js';

const MONGO_URI = "mongodb+srv://yadavrahul81135_db_user:GLAv42eWHk960j3P@cluster0.achmfoa.mongodb.net/localmart_delivery?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    // Add a mock partner who is online
    await Partner.findOneAndUpdate(
      { partnerId: "mock-partner-123" },
      { 
        isOnline: true, 
        location: {
          type: "Point",
          coordinates: [77.1025, 28.7041] // Delhi coordinates
        }
      },
      { upsert: true, new: true }
    );
    
    console.log(`Inserted mock online partner.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
