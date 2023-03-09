const { default: axios } = require("axios");
const xrpl = require("xrpl")



async function nfts(account, issuers = null) {
    const result = await axios.get(
        `https://api.xrpldata.com/api/v1/xls20-nfts/owner/${account}`
    );
    console.log(result.data.data);
    var account_nfts = result.data.data.nfts;
    var nfts = [];
    for (let i = 0; i < account_nfts.length; i++) {
        if (!issuers || issuers.includes(account_nfts[i].Issuer)) {
            var metadataLink = xrpl.convertHexToString(account_nfts[i].URI);
            var metadataJson = await axios.get(metadataLink);
            var nft = metadataJson.data;
            nfts.push(nft);
        }
    }
    return nfts;
};

module.exports = nfts;