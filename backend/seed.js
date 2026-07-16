const sequelize = require('./src/config/database');
const User = require('./src/entities/User');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    
    // Check if user exists
    const existingAdmin = await User.findOne({ where: { email: 'administrador@gmail.com' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        full_name: 'Administrador Principal',
        email: 'administrador@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created: administrador@gmail.com / admin123');
    } else {
      console.log('Admin user already exists. Updating password just in case...');
      existingAdmin.password = await bcrypt.hash('admin123', 10);
      await existingAdmin.save();
      console.log('Password updated for administrador@gmail.com');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

seed();
