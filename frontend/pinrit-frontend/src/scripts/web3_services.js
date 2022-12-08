let contractAddress = "0x4d40D54C7773388Da9F301A9ed6bB796Cada15CF";
let abi =  [
    {
      "inputs": [],
      "name": "greeting",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ]


//loading web3
async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
    }
  }
  
  //loading contract
  async function loadContract() {
    return (contract = await new window.web3.eth.Contract(abi, contractAddress));
  }


async function connectMetamask() {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            eth.sendTransaction({/* ... */});
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(currentProvider);
        // Acccounts always exposed
        eth.sendTransaction({/* ... */});
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

function getAccount() {
    return localStorage.getItem("wallet-address");
}

async function printAccount() {
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    const account = accounts[0];
    let accountAddress = document.getElementById("connected-account-address");
    let textNode = document.createTextNode(account);
    accountAddress.appendChild(textNode);
}


// printing test data
async function printingText() {
    window.contract.methods
      .greeting()
      .call()
      .then(function (string) {
        const elementTest = document.getElementById("test_text");
        elementTest.innerHTML = string;
        console.log(string);
      });
  }


async function load() {
  console.log("successful Metamask connection");
    await printAccount();
    await loadWeb3();
    window.contract = await loadContract();
    await getAllAccounts();
    await printingText();
}

load();