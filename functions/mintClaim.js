const { default: axios } = require("axios");
const xrpl = require("xrpl");

const issuer_account = process.env.ISSUER_ACCOUNT;
const issuer_secret = process.env.ISSUER_SECRET;
const metadata_uri = process.env.METADATA_URI;
const collection = process.env.COLLECTION_TAXON

function MintContents(uri, taxon) {
    return {
        TransactionType: "NFTokenMint",
        Account: issuer_account,
        TransferFee: 8000,
        NFTokenTaxon: taxon,
        Fee: "10",
        Flags: 9,
        URI: xrpl.convertStringToHex(uri),
    };
}

function CreateOffer(account, tid) {
    return {
        TransactionType: "NFTokenCreateOffer",
        Account: issuer_account,
        NFTokenID: tid,
        Amount: "1",
        Flags: 1,
        Destination: account,
    };
}


async function mintClaim(tid, uuid) {
    const { data: { data: { response: { account } } } } = await axios.get(`http://localhost:5000/payload`, //replace this with the IP your node server is on
        {
            headers: {
                "uuid": uuid
            }
        }
    );
    const { data: { data: { nfts } } } = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`);
    const result = nfts.find(item => item.NFTokenID === tid);
    if (!result) {
        return "You don't own this token"
    }
    const client = new xrpl.Client("wss://xrplcluster.com/")
    await client.connect()
    const issuer_wallet = xrpl.Wallet.fromSeed(issuer_secret);
    let mintPayload = MintContents(metadata_uri, collection)
    const prepared_offer = await client.autofill(mintPayload)
    const signed_offer = issuer_wallet.sign(prepared_offer)
    const result_offer = await client.submitAndWait(signed_offer.tx_blob)
    if (result_offer.result.meta.TransactionResult == "tesSUCCESS") {
            const issuer_nfts = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/owner/${issuer_account}`);
            const issuerNFTs = issuer_nfts.data.data.nfts
            const newTokenID = issuerNFTs.find(item => item.URI === xrpl.convertStringToHex(metadata_uri));
            let offerPayload = CreateOffer(account, newTokenID.NFTokenID)
            const preparedOffer = await client.autofill(offerPayload)
            const signedOffer = issuer_wallet.sign(preparedOffer)
            const resultOffer = await client.submit(signedOffer.tx_blob)
            if (resultOffer.result.engine_result == "tesSUCCESS") {
                console.log("Offer Submitted")
                const data = {
                    tid: newTokenID.NFTokenID,
                    issuer: issuer_account
                }
                return data
            }
            client.disconnect()
    }
    else {
        return "something went wrong"
    }
}

module.exports = mintClaim