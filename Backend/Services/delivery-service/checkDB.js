import mongoose from 'mongoose';
import Partner from './models/Partner.js';

const MONGO_URI = "mongodb+srv://yadavrahul81135_db_user:GLAv42eWHk960j3P@cluster0.achmfoa.mongodb.net/localmart_delivery?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const count = await Partner.countDocuments();
    const partners = await Partner.find({});
    console.log(`Total Partners in DB: ${count}`);
    console.log(partners);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
