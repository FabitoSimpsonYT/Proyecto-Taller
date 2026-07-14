const nodemailer = require('nodemailer');

const sendRegistrationEmail = async (owner_email, owner_name, patente, reservation_date, bus_id) => {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const confirmUrl = `http://localhost:5173/confirm-attendance/${bus_id}`;

    let info = await transporter.sendMail({
      from: '"Taller Admin" <admin@taller.local>',
      to: owner_email,
      subject: "Registro de Máquinas - Confirmación de Asistencia",
      text: `Hola ${owner_name}, tu bus con patente ${patente} ha sido registrado. Por favor, confirma tu asistencia haciendo clic en este enlace: ${confirmUrl}`,
      html: `<h3>Registro de Máquina</h3>
             <p>Hola <strong>${owner_name}</strong>,</p>
             <p>Tu bus con patente <strong>${patente}</strong> ha sido registrado para la fecha: ${new Date(reservation_date).toLocaleString()}.</p>
             <p>Para confirmar tu asistencia, por favor haz clic en el siguiente enlace:</p>
             <a href="${confirmUrl}" style="padding: 10px 20px; background-color: #fce300; color: #111; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmar Asistencia</a>`,
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
  sendRegistrationEmail
};
