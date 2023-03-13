// this is the script for issuing the ADASC token for the DAO when ready
if (typeof module !== "undefined") {
    var xrpl = require('xrpl')
}

async function main() {
    const client = new xrpl.Client('wss://xrplcluster.com/')
    await client.connect()
    const hot_wallet = "" //hot wallet address
    const cold_wallet = "" //cold wallet address
    console.log(`Got hot address ${hot_wallet.address} and cold address ${cold_wallet.address}.`)

    const cold_settings_tx = {
        "TransactionType": "AccountSet",
        "Account": cold_wallet.address,
        "TransferRate": 1010000000,
        "TickSize": 5,
        "Domain": "",
        "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,
        "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP)
    }

    const cst_prepared = await client.autofill(cold_settings_tx)
    const cst_signed = cold_wallet.sign(cst_prepared)
    console.log("Sending cold address AccountSet transaction...")
    const cst_result = await client.submitAndWait(cst_signed.tx_blob)
    if (cst_result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log(`Transaction succeeded` )
    } else {
        throw `Error sending transaction: ${cst_result}`
    }


    const hot_settings_tx = {
        "TransactionType": "AccountSet",
        "Account": hot_wallet.address,
        "Domain": "",
        "SetFlag": xrpl.AccountSetAsfFlags.asfRequireAuth,
        "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP)
    }

    const hst_prepared = await client.autofill(hot_settings_tx)
    const hst_signed = hot_wallet.sign(hst_prepared)
    console.log("Sending hot address AccountSet transaction...")
    const hst_result = await client.submitAndWait(hst_signed.tx_blob)
    if (hst_result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log(`Transaction succeeded`)
    } else {
        throw `Error sending transaction: ${hst_result.result.meta.TransactionResult}`
    }

    const currency_code = "" //ADASC currency code
    const trust_set_tx = {
        "TransactionType": "TrustSet",
        "Account": hot_wallet.address,
        "LimitAmount": {
            "currency": currency_code,
            "issuer": cold_wallet.address,
            "value": "" //number of tokens
        }
    }

    const ts_prepared = await client.autofill(trust_set_tx)
    const ts_signed = hot_wallet.sign(ts_prepared)
    console.log("Creating trust line from hot address to issuer...")
    const ts_result = await client.submitAndWait(ts_signed.tx_blob)
    if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log(`Transaction succeeded`)
    } else {
        throw `Error sending transaction: ${ts_result.result.meta.TransactionResult}`
    }


    const issue_quantity = "" //amount to send
    const send_token_tx = {
        "TransactionType": "Payment",
        "Account": cold_wallet.address,
        "Amount": {
            "currency": currency_code,
            "value": issue_quantity,
            "issuer": cold_wallet.address
        },
        "Destination": hot_wallet.address
    }

    const pay_prepared = await client.autofill(send_token_tx)
    const pay_signed = cold_wallet.sign(pay_prepared)
    console.log(`Sending ${issue_quantity} ${currency_code} to ${hot_wallet.address}...`)
    const pay_result = await client.submitAndWait(pay_signed.tx_blob)
    if (pay_result.result.meta.TransactionResult == "tesSUCCESS") {
        console.log(`Transaction succeeded`)
    } else {
        throw `Error sending transaction: ${pay_result.result.meta.TransactionResult}`
    }

    console.log("Getting hot address balances...")
    const hot_balances = await client.request({
        command: "account_lines",
        account: hot_wallet.address,
        ledger_index: "validated"
    })
    console.log(hot_balances.result)

    console.log("Getting cold address balances...")
    const cold_balances = await client.request({
        command: "gateway_balances",
        account: cold_wallet.address,
        ledger_index: "validated",
        hotwallet: [hot_wallet.address]
    })
    console.log(JSON.stringify(cold_balances.result, null, 2))

    client.disconnect()
}

main()