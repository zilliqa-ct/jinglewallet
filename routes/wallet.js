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

const {
  toBech32Address, fromBech32Address
} = require('@zilliqa-js/crypto');

var fs = require('fs');

fetchBalance = async (contractAddress, userAddress) => {
  try {
    let smartContractState = await zilliqa.blockchain.getSmartContractState(contractAddress);
    
    if(smartContractState){

      let balances_map = smartContractState.result.balances_map;

      userAddress = userAddress.toLowerCase();
      let userBalance = balances_map[userAddress];

      return userBalance;
    }
  } catch (error) {

  }
}

fetchContractData = async (contractAddress) => {
  try {
    let smartContractData = await zilliqa.blockchain.getSmartContractInit(contractAddress);
    
    if(smartContractData){


      var name = "";
      var symbol = "";

      smartContractData.result.forEach(function (item, index) {
        if (item.vname == "name") name = item.value;
        else if (item.vname == "symbol") symbol = item.value;
      });

      var contractData = { "tokenName" : name, "tokenSymbol" : symbol};

       return contractData;
    }
  } catch (error) {

  }
}

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

    const userAddress = await zilliqa.wallet.addByKeystore(data,pp).catch((err)=>{
      res.render("form", { title: "Jingle Wallet v1.0", error: true});
      return;
    });

    // hardcoding the smart contract address
    // todo - find a better way to specify
    
    var contractAddress = "zil1hn45mrklee9ytmgljjwlc2dwu32p9anj732df9";
    var zrc2TokenBalance = 0;

    zrc2TokenBalance = await fetchBalance(contractAddress, userAddress);

    contractData = await fetchContractData(contractAddress);

    // convert user address to bech32

    // userAddress = toBech32Address("0x" + userAddress);

    res.render('wallet', { title: "Jingle Wallet v1.0", key: userAddress, balance: {  data: contractData, zrc2balance: zrc2TokenBalance } });

  })


});


  module.exports = router;