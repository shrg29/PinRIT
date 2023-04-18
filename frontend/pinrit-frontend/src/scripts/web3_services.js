
import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract = "0xc91Dcf983AfBDb9f2f5ecc50ad9A7608D83c4e6D"

//loading web3
async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
    }
}

//loading contract
async function loadContract() {
    return (contract = await new window.web3.eth.Contract(myJson.abi, myJson.address));
}

//connecting to Metamask
export async function connectMetamask() {
    console.log("konektiran sam ")
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            eth.sendTransaction({/* ... */ });
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(currentProvider);
        // Acccounts always exposed
        eth.sendTransaction({/* ... */ });
    }
    // Non-dapp browsers...
    else {
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
};

async function getAllAccounts() {
    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        localStorage.setItem("wallet-address", JSON.stringify(accounts[0]));
    });
}

async function printAccount() {
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log("My Metamask address: " + account)
    let accountAddress = document.getElementById("connected-account-address");
    let textNode = document.createTextNode(account);
    accountAddress.appendChild(textNode);
}

    //loads at page rendering
    async function load() {
        await printAccount();
        await loadWeb3();
        window.contract = await loadContract();
        await getAllAccounts();
    }

    load();




