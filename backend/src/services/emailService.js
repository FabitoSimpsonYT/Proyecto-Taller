const nodemailer = require('nodemailer');

const enviarCorreoRegistro = async (correo_dueno, nombre_dueno, patente, fecha_reserva, reservacion_id) => {
  try {
    let cuentaPrueba = await nodemailer.createTestAccount();
    let transportador = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: cuentaPrueba.user,
        pass: cuentaPrueba.pass,
      },
    });

    const urlConfirmacion = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-attendance/${reservacion_id}`;

    let info = await transportador.sendMail({
      from: '"Taller Admin" <admin@taller.local>',
      to: correo_dueno,
      subject: "Registro de Máquinas - Confirmación de Asistencia",
      text: `Hola ${nombre_dueno}, tu bus con patente ${patente} ha sido registrado. Por favor, confirma tu asistencia haciendo clic en este enlace: ${urlConfirmacion}`,
      html: `<h3>Registro de Máquina</h3>
             <p>Hola <strong>${nombre_dueno}</strong>,</p>
             <p>Tu bus con patente <strong>${patente}</strong> ha sido registrado para la fecha: ${new Date(fecha_reserva).toLocaleString()}.</p>
             <p>Para confirmar tu asistencia, por favor haz clic en el siguiente enlace:</p>
             <a href="${urlConfirmacion}" style="padding: 10px 20px; background-color: #fce300; color: #111; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmar Asistencia</a>`,
    });

    console.log("Mensaje enviado: %s", info.messageId);
    console.log("URL de vista previa: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};

module.exports = {
  enviarCorreoRegistro
};
