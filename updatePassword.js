const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function updatePassword() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smartplay');
  const hash = await bcrypt.hash('admin123', 10);
  console.log('New hash:', hash);
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'bornfacek135@gmail.com' },
    { $set: { password: hash } }
  );
  console.log('Updated:', result.modifiedCount, 'user(s)');
  await mongoose.disconnect();
  process.exit();
}

updatePassword();