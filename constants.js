require('dotenv');

const auth = {
    type: 'OAuth2',
    user: 'kumaravishrant.scoe.comp@gmail.com',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    rereshToken: process.env.REFRESH_TOKEN,
}
const mailOptions = {
    from: 'kumaravishrant.scoe.comp@gmail.com',
    to: 'omsaiservices225@gmail.com',
    subject: 'Out of office',
}
module.exports = {
    auth,
    mailOptions
}