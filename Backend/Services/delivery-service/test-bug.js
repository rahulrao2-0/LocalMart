import mongoose from "mongoose";
import Delivery from "./models/Delivery.js";

async function test() {
  try {
    await mongoose.connect("mongodb+srv://yadavrahul81135_db_user:GLAv42eWHk960j3P@cluster0.achmfoa.mongodb.net/localmart_delivery?appName=Cluster0");
    console.log("Connected");
    
    const deliveryPartnerId = "067fd13d-5dfa-43f9-8fc6-707d22f22d30";
    
    const deliveries = await Delivery.find({
      $or: [
        { deliveryPartnerId },
        { status: "SEARCHING_FOR_PARTNER" }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(deliveries);
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    mongoose.disconnect();
  }
}
test();
