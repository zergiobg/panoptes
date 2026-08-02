export async function sendSMS(phone: string, message: string): Promise<boolean> {
    const useRealSms = process.env.USE_REAL_SMS === 'true';

    if (useRealSms) {
        // TODO: In the future, implement Twilio or AWS SNS here
        // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        // await client.messages.create({ body: message, from: '+1234567890', to: phone });
        console.log(`[REAL SMS] Enviando SMS a ${phone}`);
        return true;
    } else {
        // DUMMY SIMULATOR
        console.log('--------------------------------------------------');
        console.log(`📱 [DUMMY SMS SIMULATOR]`);
        console.log(`A: ${phone}`);
        console.log(`Mensaje: ${message}`);
        console.log('--------------------------------------------------');
        return true;
    }
}
