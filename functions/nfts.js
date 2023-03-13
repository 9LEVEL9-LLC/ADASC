// Import necessary modules
const { default: axios } = require("axios");
const xrpl = require("xrpl")

// Define function to retrieve NFTs belonging to a given account and filter by issuer if provided
async function nfts(account, issuers = null) {
    // Retrieve account's NFTs from XRPLData API
    const result = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`);
    // Iterate through NFTs, filtering by issuer if provided and checking if NFT has URI
    var account_nfts = result.data.data.nfts;
    var nfts = [];
    for (let i = 0; i < account_nfts.length; i++) {
        if (!account_nfts[i].URI) continue
        if (!issuers || issuers.includes(account_nfts[i].Issuer)) {
            // Retrieve metadata for NFT and check if response is JSON
            var metadataLink = xrpl.convertHexToString(account_nfts[i].URI);
            var metadataResponse = await axios.get(metadataLink.replace("ipfs://", "https://ipfs.io/ipfs/"));
            if (metadataResponse.headers["content-type"].startsWith("application/json")) {
                // If response is JSON, add to list of NFTs
                var nft = metadataResponse.data;
                nfts.push(nft);
            }
        }
    }
    // Return list of NFTs
    return nfts;
};

module.exports = nfts;