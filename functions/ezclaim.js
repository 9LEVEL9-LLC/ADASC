
// Import necessary modules
const { default: axios } = require("axios");
require("dotenv").config({
    path: ".env",
});
const sign = require("./sign");

async function claimEZ(uuid, issuer, tid) {
    // Fetch user's XRP Ledger account and XUMM issued token from local API
    const { data: { data: { response: { account }, application: { issued_user_token } } } } = await axios.get(`http://localhost:5000/payload/`,  //replace this with the IP of where you're running the node server
        {
            headers: {
                "uuid": uuid,
            },
        });
    // Fetch all active NFT sell offers on XRP Ledger for the issuer
    const { data: { data: { offers } } } = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/offers/offerowner/${issuer}`);
    // Find the NFT sell offer made to the user with specified token ID
    const claimOffer = offers.find(offer => offer.Destination === account && offer.NFTokenID === tid);
    if (!claimOffer) {
        // Return if no NFT sell offer found for the user with specified token ID
        return "No Offers";
    }
    // Create XUMM sign request for the user to claim the NFT sell offer
    const signQR = await await axios.get(`http://localhost:5000/sign/test`, //replace this with the IP of where you're running the node server
        {
            headers:{
                "account": account,
        "user-token": issued_user_token,
        "offer": claimOffer.OfferID
    }
            }    )
    console.log(signQR.data)
    return signQR.data;
};

module.exports = claimEZ;
