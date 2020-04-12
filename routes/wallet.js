/**
 * Routes Definitions
 */

const {Zilliqa} = require('@zilliqa-js/zilliqa'); 
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');

const {
  decryptPrivateKey,
  getAddressFromPrivateKey,
} = require('@zilliqa-js/crypto');


var express = require('express');
var router = express.Router();

var multer = require('multer');

var uploads = multer({
  dest: 'public/uploads/'
});

let utility = require('../utility/utility.js');
let Utility = utility.Utility;

const {
  toBech32Address, fromBech32Address
} = require('@zilliqa-js/crypto');

var fs = require('fs');

/* read the keystore */
router.post('/',  uploads.single('keystore'), function (req, res, next) {

  if (req.file) {
		
		if (req.file.size === 0) {
      res.render("form", { title: "Jingle Wallet v1.0", error: true});
      return;
    }

  // Check if the file exists in the current directory, and if it is readable.
  fs.access(req.file.path, fs.constants.F_OK | fs.constants.R_OK, (err) => {
    if (err) {
      console.error(
        `${req.file.path} ${err.code === 'ENOENT' ? 'does not exist' : 'not accessible'}`);
        res.render("form", { title: "Jingle Wallet v1.0", error: true});
        return;
      }
  
    });

  }
  
  const ks = req.file.path;
  const pp = req.body.password;

  fs.readFile(ks, async function (err, data) {
    if (err) {
      console.error(err);
      res.render("form", { title: "Jingle Wallet v1.0", error: true});
      return;
    }

    let keystore = JSON.parse(data);

    const pk = await decryptPrivateKey(pp, keystore);

    if (!pk)
    {
      res.render("form", { title: "Jingle Wallet v1.0", error: true});
      return;
    }

    var session = req.session;

    session.privatekey = pk;

    const userAddress =  getAddressFromPrivateKey(pk);
    
    if (userAddress)
    {
      session.useraddress = userAddress;
    }
    else
    {
      res.render("form", { title: "Jingle Wallet v1.0", error: true});
      return;
    }

    //const userAddress = await zilliqa.wallet.addByKeystore(data,pp).catch((err)=>{
    //  res.render("form", { title: "Jingle Wallet v1.0", error: true});
    //  return;
    //});

    // hardcoding the smart contract address
    // todo - find a better way to specify
    
    var contractAddress = "zil1hn45mrklee9ytmgljjwlc2dwu32p9anj732df9";
    var zrc2TokenBalance = 0;

    zrc2TokenBalance = await Utility.fetchBalance(contractAddress, userAddress);

    contractData = await Utility.fetchContractData(contractAddress);

    // store the contract address
    session.contractaddress = contractAddress;    

    res.render('wallet', { title: "Jingle Wallet v1.0", key: userAddress, balance: {  data: contractData, zrc2balance: zrc2TokenBalance } });

  })


});

module.exports = router;