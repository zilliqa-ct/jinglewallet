const {Zilliqa} = require('@zilliqa-js/zilliqa'); 
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');

const {
    decryptPrivateKey,
    getAddressFromPrivateKey,
  } = require('@zilliqa-js/crypto');

class Wallet {

    static login = async (req) => {

        var fs = require('fs');

        if (!req.file) {
            throw ("No keystore file specified");
        }
        
        if (req.file.size === 0) {
            throw ("Keystore file size is 0");
        }
        
    
        // Check if the file exists in the current directory, and if it is readable.
        fs.access(req.file.path, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                if (err) {
                    throw ("Keystore file cannot be accessed");
                }
        
        });

        const ks = req.file.path;
        const pp = req.body.password;

        const fileData = fs.readFileSync(ks);

        if (!fileData) {
            throw ("Keystore file cannot be accessed");
        }
    
        let keystore = JSON.parse(fileData);

        const pk = await decryptPrivateKey(pp, keystore);

        if (!pk){
            throw ("Cannot decrypt private key");
        }

        const userAddress =  getAddressFromPrivateKey(pk);

        if (!userAddress) {
            throw ("Cannot find user account address")
        }

        var loginState = { "pk" : pk, "userAddress" : userAddress};

        return loginState;
    }
}

module.exports = {
    Wallet: Wallet
}