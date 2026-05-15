const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./database/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/smartplay').then(async () => {
  console.log('Connected to MongoDB – deleting all users...');
  await User.deleteMany({});

  const users = [
    { username: 'Bornface Kangombe', email: 'bornface@smartplay.com', role: 'admin' },
    { username: 'Boyd Kangombe',    email: 'boyd@smartplay.com',      role: 'listener' },
    { username: 'Isaac Kangombe',   email: 'isaac@smartplay.com',     role: 'listener' },
    { username: 'Bilyanga Kangombe',email: 'bilyanga@smartplay.com',  role: 'listener' },
    { username: 'Deborah Kangombe', email: 'deborah@smartplay.com',   role: 'listener' },
    { username: 'Wizzy Sandando',   email: 'wizzy@smartplay.com',     role: 'artist' },
    { username: 'Kayombo Kays',     email: 'kayombo@smartplay.com',   role: 'listener' },
    { username: 'Chinyama Kays',    email: 'chinyama@smartplay.com',  role: 'listener' },
    { username: 'Kabombo Kangombe', email: 'kabombo@smartplay.com',   role: 'artist' },
    { username: 'Cynthia Kangombe', email: 'cynthia@smartplay.com',   role: 'listener' },
    { username: 'Laverty Lubinda',  email: 'laverty@smartplay.com',   role: 'artist' }
  ];

  const password = 'admin123';          // same for all – change after login
  const hashedPassword = await bcrypt.hash(password, 12);

  const userDocs = users.map(u => ({
    username: u.username,
    email: u.email,
    password: hashedPassword,
    role: u.role
  }));

  await User.insertMany(userDocs);
  console.log('✅ All users created successfully');
  console.log('Passwords are: admin123');
  process.exit();
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});