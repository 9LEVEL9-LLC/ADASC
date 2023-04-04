const xrpl = require("xrpl");
const lodash = require("lodash");


async function checkHoldings(account) {
    const client = new xrpl.Client('wss://xrplcluster.com/')
    await client.connect().catch((error) => {
        console.error(error);
    });
    const response = await xrplclient
        .request({
            command: "account_lines",
            account: account,
        })
        .catch((error) => {
            console.error(error);
        });
    holdingCheck = lodash.filter(response.result.lines, {
        account: "", //account that issued the trust line
    });
    const holdings = holdingCheck[0].balance;
    client.disconnect();
    return holdings;
}

module.exports = checkHoldings;