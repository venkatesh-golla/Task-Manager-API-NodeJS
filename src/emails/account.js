const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: 'golla.venkatesh1997@gmail.com,',
            subject: 'Thanks for joining in',
            text: `Welcome to the Application ${name}. Let me know how you get along with the application`
        })
    }
    catch (e) {
        console.log(`Error Message: ${e}`)
    }
}

const sendCancelEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: 'golla.venkatesh1997@gmail.com,',
            subject: 'Your account has been removed',
            text: `Sorry to see you leaving ${name}. Could you please provide us some feedback?`
        })
    }
    catch (e) {
        console.log(`Error Message: ${e}`)
    }
}

module.exports = {
    sendWelcomeEmail, sendCancelEmail
}
