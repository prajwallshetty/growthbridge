const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://prajwal0shetty11_db_user:rqXqUvoSsOltspIj@cluster0.orimiyw.mongodb.net/?appName=Cluster0";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  const domains = await mongoose.connection.db.collection("internshipdomains").find({}).toArray();
  console.log("Domains in DB:", domains);
  await mongoose.disconnect();
}

main().catch(console.error);
