const { default: axios } = require("axios");

async function isClaimed(account, taxon, issuer) {
    // Declare an array to store claimable NFTs
    const claimable = []

    // Retrieve the NFTs owned by the user's account
    const ownerNFTs = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`);

    // Extract the NFTs that match the specified taxon
    var owner_nfts = ownerNFTs.data.data.nfts
    var claimableNFTs = owner_nfts.filter(owner_nfts => taxon === owner_nfts.Taxon)

    // Retrieve the NFTs owned by the issuer account
    const claimCheck = await axios.get(`https://api.xrpldata.com/api/v1/xls20-nfts/owner/${issuer}`);
    var issuer_nfts = claimCheck.data.data.nfts

    // Iterate through the claimable NFTs and check if they have been claimed already
    for (let i = 0; i < claimableNFTs.length; i++) {
        // Look up the NFT in the database using its NFTokenID
        var tid = "234872628738ytuytue87w"// database where token-to-claims ID is 

        // Check if the NFT has been claimed by the issuer account
        var result = issuer_nfts.find(item => item.NFTokenID === tid);
        if (result) {
            // If the NFT has been claimed, add it to the claimable array with the "claimed" flag set to false
            var data = {
                name: claimableNFTs[i].NFTokenID,
                claimed: false,
            };
            claimable.push(data)
        }
        else {
            // If the NFT has not been claimed, add it to the claimable array with the "claimed" flag set to true
            var data = {
                name: claimableNFTs[i].NFTokenID,
                claimed: true,
            };
            claimable.push(data)
        }
    }
    // Sort the claimable array by NFT ID
    claimable.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
    // Return array of claims
    return claimable;
}

module.exports = isClaimed;
