import mongoose from 'mongoose'; 
mongoose.connect('mongodb+srv://yadavrahul81135_db_user:v4tsycl9XgxtGH68@cluster0.crn62es.mongodb.net/localmart_user_db?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => { 
  const db = mongoose.connection.useDb('localmart_user_db'); 
  const users = await db.collection('users').find({ _id: { $in: ['067fd13d-5dfa-43f9-8fc6-707d22f22d30', '29923a9e-0c62-4e9f-a309-3e7ee51c0198'] } }).toArray(); 
  console.log(JSON.stringify(users, null, 2)); 
  process.exit(0); 
});
