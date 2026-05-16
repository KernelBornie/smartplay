const mongoose = require('mongoose');

async function syncUsers() {
  // Connect to local MongoDB
  await mongoose.connect('mongodb://127.0.0.1:27017/smartplay');
  const localUsers = await mongoose.connection.db.collection('users').find().toArray();
  console.log('Found ' + localUsers.length + ' local users');
  await mongoose.disconnect();

  // Connect to Atlas
  await mongoose.connect('mongodb+srv://bornfacekangombe_db_user:smartplay2026@purveyols.brqv2co.mongodb.net/smartplay?retryWrites=true&w=majority');
  
  for (const user of localUsers) {
    delete user._id;
    await mongoose.connection.db.collection('users').updateOne(
      { email: user.email },
      { $setOnInsert: user },
      { upsert: true }
    );
    console.log('Synced: ' + user.email);
  }
  
  await mongoose.disconnect();
  console.log('Done! All users synced to Atlas.');
  process.exit();
}

syncUsers();