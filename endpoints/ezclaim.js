const { default: axios } = require("axios");
require("dotenv").config({
    path: ".env",
});
const sign = require("./sign")





async function claim(uuid, issuer, tid) {
	const { data: { data: { response: { account }, application: { issued_user_token } } } } = await axios.get(`http://localhost:5000/payload/${uuid}`);
    const { data: { data: { offers } } } = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/offers/offerowner/${issuer}`)
    const claims = offers.find(offer => offer.Destination === account && item.NFTokenID === tid);
    if (!claims) {
        return "No Offers"
    }
    const signQR = await sign(account, claims.OfferID, issued_user_token);
    return signQR
};

module.exports = claim;
