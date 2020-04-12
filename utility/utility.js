const {Zilliqa} = require('@zilliqa-js/zilliqa'); 
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');


class Utility {

    static fetchBalance = async (contractAddress, userAddress) => {
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

    static fetchContractData = async (contractAddress) => {
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
}



module.exports = {
    Utility: Utility
}