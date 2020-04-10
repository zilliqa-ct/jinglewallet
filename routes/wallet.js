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

    const address = await zilliqa.wallet.addByKeystore(data,pp).catch((err)=>{
      res.render("form", { title: "Jingle Wallet v1.0", error: true});
      return;
    });

    res.render('wallet', { title: "Jingle Wallet v1.0", key: address });

  })


});


  module.exports = router;