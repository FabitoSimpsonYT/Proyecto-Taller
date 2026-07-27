require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Usuario } = require('./src/entities/index.entities');
const sequelize = require('./src/config/database');

async function createDefaultUsers() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    
    // Sincronizar modelos (por si acaso)
    await sequelize.sync();

    // Comprobar y crear Admin
    const adminExists = await Usuario.findOne({ where: { correo: 'admin@gmail.com' } });
    if (!adminExists) {
      const adminHashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        nombre_completo: 'Administrador Principal',
        rut: '11111111-1',
        correo: 'admin@gmail.com',
        contrasena: adminHashedPassword,
        rol: 'admin'
      });
      console.log('✅ Usuario Administrador creado: admin@gmail.com / admin123');
    } else {
      console.log('⚠️ El usuario Administrador ya existe.');
    }

    // Comprobar y crear Mecánico
    const mecanicoExists = await Usuario.findOne({ where: { correo: 'mecanico@gmail.com' } });
    if (!mecanicoExists) {
      const mecanicoHashedPassword = await bcrypt.hash('mecanico123', 10);
      await Usuario.create({
        nombre_completo: 'Mecánico de Turno',
        rut: '22222222-2',
        correo: 'mecanico@gmail.com',
        contrasena: mecanicoHashedPassword,
        rol: 'mecanico'
      });
      console.log('✅ Usuario Mecánico creado: mecanico@gmail.com / mecanico123');
    } else {
      console.log('⚠️ El usuario Mecánico ya existe.');
    }

    console.log('Finalizado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    process.exit(1);
  }
}

createDefaultUsers();
