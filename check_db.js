const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/complaintDB")
  .then(async () => {
    console.log("\n📦 Successfully connected to complaintDB!");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log("No collections found in this database.");
    } else {
      console.log(`\nFound ${collections.length} collections:`);
      
      for (const col of collections) {
        console.log(`\n➡️ Collection: ${col.name}`);
        const data = await mongoose.connection.db.collection(col.name).find().limit(3).toArray();
        if (data.length === 0) {
          console.log("   (Empty collection)");
        } else {
          console.log(`   Showing first ${data.length} documents:`);
          console.log(JSON.stringify(data, null, 2));
        }
      }
    }
    
    console.log("\nDone!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Connection Error:", err);
  });
