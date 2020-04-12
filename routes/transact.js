/**
 * Routes Definitions
 */

const {Zilliqa} = require('@zilliqa-js/zilliqa'); 
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');


var express = require('express');
var router = express.Router();

let utility = require('../utility/utility.js');
let Utility = utility.Utility;

let wallet = require('../wallet.js');
let Wallet = wallet.Wallet;

/* read the keystore */
router.post('/send', async function (req, res, next) {

  try {

    var contractAddress = "zil1hn45mrklee9ytmgljjwlc2dwu32p9anj732df9";
    var session = req.session;

    let sendState = await Wallet.sendTransaction(session.privatekey, contractAddress, req.body.address, req.body.amount);

    var zrc2TokenBalance = 0;

    zrc2TokenBalance = await Utility.fetchBalance(contractAddress, session.useraddress);

    contractData = await Utility.fetchContractData(contractAddress);   

    res.render('wallet', { title: "Jingle Wallet v1.0", status: true, statusText: sendState, key: session.useraddress, balance: {  data: contractData, zrc2balance: zrc2TokenBalance } });

  } catch (e)
  {
    // default to the last known status
    res.render('wallet', { title: "Jingle Wallet v1.0", error: true, errorText: e, key: session.useraddress, balance: {  data: session.contractData, zrc2balance: session.zrc2TokenBalance } });
  }


});

module.exports = router;