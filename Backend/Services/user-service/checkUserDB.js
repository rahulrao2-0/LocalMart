import mongoose from 'mongoose';
import { UserProfile } from './models/UserProfile.js';
import { DeliveryPartner } from './models/DeliveryPartner.js';

const MONGO_URI = "mongodb+srv://yadavrahul81135_db_user:GLAv42eWHk960j3P@cluster0.achmfoa.mongodb.net/localmart_users?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    const partners = await DeliveryPartner.find({});
    console.log("Real Partners in user-service:");
    console.log(partners);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
