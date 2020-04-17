const {Zilliqa} = require('@zilliqa-js/zilliqa'); 
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');

const {
    decryptPrivateKey,
    getAddressFromPrivateKey,
    fromBech32Address,
    toBech32Address
  } = require('@zilliqa-js/crypto');

  const {BN, Long, bytes, units} = require('@zilliqa-js/util');

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

    static sendTransaction = async(privateKey, contractAddress, recipientAddress, sendingAmount) => {
        let zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
        zilliqa.wallet.addByPrivateKey(privateKey);
    
        const CHAIN_ID = 333;
        const MSG_VERSION = 1;
        const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
    
    
        const myGasPrice = units.toQa('1000', units.Units.Li); // Gas Price that will be used by all transactions
        recipientAddress = fromBech32Address(recipientAddress);//converting to ByStr20 format
        // const ftAddr = toBech32Address(contractAddress);

        try {
            const contract = zilliqa.contracts.at(contractAddress);
            const callTx = await contract.call(
                'Transfer',
                [
                    {
                        vname: 'to',
                        type: 'ByStr20',
                        value: recipientAddress,
                    },
                    {
                        vname: 'amount',
                        type: 'Uint128',
                        value: sendingAmount,
                    }
                ],
                {
                    // amount, gasPrice and gasLimit must be explicitly provided
                    version: VERSION,
                    amount: new BN(0),
                    gasPrice: myGasPrice,
                    gasLimit: Long.fromNumber(10000),
                },
                33,
                1000,
                false,
            );

            console.log(JSON.stringify(callTx.receipt, null, 4));

            return callTx.id;
        
        } catch (err) {
            throw ("Could not send" + err);
        }
        }
}

module.exports = {
    Wallet: Wallet
}