const { default: axios } = require("axios");
require("dotenv").config({
    path: ".env",
});


const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;



async function sign(account, offer, user_token){
    console.log(new Date().toString(), "sign request");
    console.log(user_token)
    try {
        const payload = await axios.post(
            "https://xumm.app/api/v1/platform/payload",
            JSON.stringify({
                user_token: user_token,
                txjson: {
                    TransactionType: "NFTokenAcceptOffer",
                    Account: account,
                    NFTokenSellOffer: offer,
                },
            }),
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY,
                    "X-API-Secret": API_SECRET,
                },
            }
        );
        console.log(payload.data);
        console.log(user_token)
        console.log(account)
        if (payload.status === 200)
            return res.json(payload.data.refs.qr_png);
    } catch (e) {
        console.log(new Date().toString(), "Sign Request Failed");
        console.log(e);
        return res.json("Failed");
    }
}

module.exports = sign;