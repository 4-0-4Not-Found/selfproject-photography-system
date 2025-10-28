// create-admin.js
require('dotenv').config();
const sequelize = require('./Config/database');
const { User } = require('./Models');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const adminEmail = 'admin@photostudio.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@photostudio.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();