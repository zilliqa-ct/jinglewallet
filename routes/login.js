/**
 * Routes Definitions
 */

const {Zilliqa} = require('@zilliqa-js/zilliqa'); 
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');


var express = require('express');
var router = express.Router();

var multer = require('multer');

var uploads = multer({
  dest: 'public/uploads/'
});

let utility = require('../utility/utility.js');
let Utility = utility.Utility;

let wallet = require('../wallet.js');
let Wallet = wallet.Wallet;

const {
  toBech32Address, fromBech32Address
} = require('@zilliqa-js/crypto');

/* read the keystore */
router.post('/',  uploads.single('keystore'), async function (req, res, next) {

  try {
    let loginState = await Wallet.login(req);
  
    var session = req.session;

    session.privatekey = loginState.pk;
    session.useraddress = loginState.userAddress;
      
      var contractAddress = "zil1hn45mrklee9ytmgljjwlc2dwu32p9anj732df9";
      var zrc2TokenBalance = 0;

      zrc2TokenBalance = await Utility.fetchBalance(contractAddress, loginState.userAddress);

      contractData = await Utility.fetchContractData(contractAddress);

      // store the contract address
      session.contractaddress = contractAddress; 
      
      session.contractData = contractData;
      session.zrc2TokenBalance = zrc2TokenBalance;

      res.render('wallet', { title: "Jingle Wallet v1.0", key: loginState.userAddress, balance: {  data: contractData, zrc2balance: zrc2TokenBalance } });

  } catch (e)
  {
    res.render("form", { title: "Jingle Wallet v1.0", error: true, errorText: e});
  }


});

module.exports = router;