const axios = require('axios');
const { createConfig } = require('./utils');
const nodemailer = require('nodemailer');
const CONSTANTS = require('./constants');
const { google } = require('googleapis');

require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function getThreads() {
    try{
        const url = `https://gmail.googleapis.com/gmail/v1/users/kumaravishrant.scoe.comp@gmail.com/threads/?maxResults=5`;
        const { token } = await oAuth2Client.getAccessToken();
        const config = createConfig(url, token);
        const response = await axios(config);
        
        let data = await response.data;
        //res.json(data);
        // console.log("dtaId:",data.threads[0].id);
        const threadIds = data.threads.map(item => item.id);
        console.log('Found the following new threads with ids', threadIds)
        const email="kumaravishrant.scoe.comp@gmail.com"
        checkThreads(email,threadIds);
    }
    catch(error){
        console.log(error);
    }
}

async function checkThreads(email, ids) {
for (id of ids) {
    try{
        console.log('\n\nChecking the thread with id', id)
        const url = ` https://gmail.googleapis.com/gmail/v1/users/kumaravishrant.scoe.comp@gmail.com/threads/${id}`;
        const { token } = await oAuth2Client.getAccessToken();
        const params = {
            maxResults: 1
        }
        const config = createConfig(url, token);
        const response = await axios(config);
        
        let data = await response.data;
        //console.log(data)
        const isAlreadySent=data.messages[data.messages.length-1].snippet.indexOf(email)!==-1;
        if(data.messages.length>1&&isAlreadySent){
            console.log("This thread already has a reply");
        }else{
            console.log("No previous reply found on this thread, sending reply");
            const fromEmail = await getFromEmail(data.messages[0].id)
            if(fromEmail)
                await sendMail(fromEmail)
            else
                console.log("Error while getting from-email for this thread, skipping...")
        }
    }
    catch(error){
        console.log("error retreiving id");
    }
}
}

async function getFromEmail(iD) {
    try{
        const url = `https://gmail.googleapis.com/gmail/v1/users/kumaravishrant.scoe.comp@gmail.com/messages/${iD}`;
        const { token } = await oAuth2Client.getAccessToken();
        const config = createConfig(url, token);
        const response = await axios(config);
        
        let data = await response.data;

        const headers = data.payload.headers;

        // Find the header with the name "From"
        const fromHeader = headers.find(header => header.name.toLowerCase() === 'from');

        // Extract the email address from the "From" header
        const fromEmail = fromHeader ? fromHeader.value : null;
        
        const startIndex = fromEmail.indexOf('<');
        const endIndex = fromEmail.indexOf('>');

        // Extract the content between '<' and '>'
        const emailAddress = fromEmail.substring(startIndex + 1, endIndex);
        
        return emailAddress;
    }
    catch(error){
        console.log(error);
    }
}

async function sendMail(toEmail) {
    try{
        const accessToken = await oAuth2Client.getAccessToken();
        let token = await accessToken.token;

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                ...CONSTANTS.auth,
                accessToken: token,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'kumaravishrant.scoe.comp@gmail.com',
            to: `${toEmail}`,
            subject: 'Out of office',
            text: 'I am unavailable at the moment'
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent to ', mailOptions.fromEmail);
    }
    catch(error){
        console.log(error);
    }
}

getThreads()