const NodeMailer = require('nodemailer');

const EmailService = function() {
    // This should be from config
    const systemEmail = 'itpsychiatrist.policymanager@gmail.com';
    const systemEmailPassword = 'Aspire2CKD';
    const transporter = NodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: systemEmail,
            pass: systemEmailPassword
        }
    });
    this.sendEmail = (recieverEmail, subject, emailContent) => {
        const mailOptions = {
            from: systemEmail,
            to: recieverEmail,
            subject: subject,
            html: emailContent
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {

                console.log(info);
            }
        })
    }
}

module.exports = EmailService;
