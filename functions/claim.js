// Import necessary modules
const { default: axios } = require("axios");
const xrpl = require("xrpl");
const sign = require("./sign")
require("dotenv").config({
    path: "./.env",
});

// Get necessary environment variables
const issuer_key = process.env.ISSUER_SECRET 
const issuer_account = process.env.ISSUER_ACCOUNT


// Function to create an offer for the given account and token ID
function CreateOffer(account, tokenID) { 
    return {
        TransactionType: "NFTokenCreateOffer",
        Account: issuer_account,
        NFTokenID: tokenID,
        Amount: "1",
        Flags: 1,
        Destination: account,
    };
}

// Function for the issuer to create the offer and send a sign request to the user
async function claim(tokenID, uuid) {
    // Get the user's XRP Ledger account and issued user token using the uuid
    const { data: { data: { response: { account }, application: { issued_user_token } } } } = await axios.get(`http://localhost:5000/payload/${uuid}`); //replace this with the IP of where you're running the node server
    const user_token = issued_user_token
    // Get the user's NFTs
    const { data: { data: { nfts } } } = await axios.get(
        `https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`);
    // Find the NFT with the given token ID
    const result = nfts.find(item => item.NFTokenID === tokenID);
    if (!result) { 
        // Return if the user does not own the token
        return "You don't own this token"
    }
    const isClaimed = ""//database check if token id is claimed or not
    if (!isClaimed) {
        // If the token is not claimed, get the token ID and make an offer to the account to claim it
        const claimTokenID = ""//token id of nft to be claimed;
        const client = new xrpl.Client("wss://xrplcluster.com/");
        await client.connect();
        let nftSellOffers;
        // Check to see if an offer exists
        try { 
            nftSellOffers = await client.request({
                method: "nft_sell_offers",
                nft_id: claimTokenID
            });
        } catch (err) { 
            // If offer doesn't exist, create an offer for the account to claim the NFT
            nftSellOffers = false;
            const issuer_wallet = xrpl.Wallet.fromSeed(issuer_key);
            let offerPayload = CreateOffer(account, claimTokenID)
            const prepared_offer = await client.autofill(offerPayload)
            const signed_offer = issuer_wallet.sign(prepared_offer)
            const result_offer = await client.submit(signed_offer.tx_blob)
            if (!result_offer.result.engine_result == "tesSUCCESS") { 
                // If offer doesn't go through, return this
                return "Error in offer creation"
            }
            // Get the offer ID of the offer that was just created
            let claimSellOffer;
            try { 
                claimSellOffer = await client.request({
                    method: "nft_sell_offers",
                    nft_id: claimTokenID
                });
            } catch (err) { 
                // If no offer was created return this
                return "Problem with rippled server"
            }
            client.disconnect();
            const offerID = claimSellOffer.result.offers[0].nft_offer_index;
            //send the offer to the sign function/endpoint that sends the sign request to the users XUMM app and also return a scannable QR
            const signQR = await sign(account, offerID, user_token);
            return signQR 
        }
        // If an offer exists for the NFT, check if the account is the destination and send sign request
        if (nftSellOffers.result.offers[0].destination === account) {
            const signQR = await sign(account, nftSellOffers.result.offers[0].nft_offer_index, user_token);
            return signQR
        }
        // Return if none of this works
        return "Unknown error occurred"
    }
    // If token is already claimed, return this
    return "Claimed"
};

module.exports = claim;
