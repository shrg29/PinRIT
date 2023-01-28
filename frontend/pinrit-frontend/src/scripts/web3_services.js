
import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract ="0xE5E559cd3C67d02840257518e81A16324C07415A"

let name = document.getElementById("name")
let description = document.getElementById("description")
let price = document.getElementById("price")
let formParams = {name, description, price}

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

function updateFormParams(parName, parDesc, parPrice) {
    formParams.name = parName
    formParams.description = parDesc
    formParams.price = parPrice
}

async function OnChangeFile(e) {
    var file = e.target.files[0];
    //check for file extension
    try {
        //upload the file to IPFS
        const response = await uploadFileToIPFS(file);
        if(response.success === true) {
            console.log("Uploaded image to Pinata: ", response.pinataURL)
            setFileURL(response.pinataURL);
        }
    }
    catch(e) {
        console.log("Error during file upload", e);
    }
}

async function uploadMetadataToIPFS() {
    console.log("sven nema pisu")
    const {name, description, price} = formParams;
    //Make sure that none of the fields are empty
    if( !name || !description || !price || !fileURL)
        return;

    const nftJSON = {
        name, description, price, image: fileURL
    }

    try {
        //upload the metadata JSON to IPFS
        const response = await uploadJSONToIPFS(nftJSON);
        if(response.success === true){
            console.log("Uploaded JSON to Pinata: ", response)
            return response.pinataURL;
        }
    }
    catch(e) {
        console.log("error uploading JSON metadata:", e)
    }
}

async function listNFT(e) {
    e.preventDefault();

    //Upload data to IPFS
    try {
        const metadataURL = await uploadMetadataToIPFS();
        //massage the params to be sent to the create NFT request
        const price = ethers.utils.parseUnits(formParams.price, 'ether')
        let listingPrice = await window.contract.getListPrice()
        listingPrice = listingPrice.toString()

        //actually create the NFT
        let transaction = await window.contract.createToken(metadataURL, price, { value: listingPrice })
        await transaction.wait()

        alert("Successfully listed your NFT!");
        updateMessage("");
        updateFormParams('', '', '');
        window.location.replace("/")
    }
    catch(e) {
        alert( "Upload error"+e )
    }
}

// // printing test data
// async function mint() {
//     window.contract.methods
//       .mintNFT()
//       .call()
//       .then(function (uint) {
//         const elementTest = document.getElementById("test_text");
//         elementTest.innerHTML = string;
//         console.log(string);
//       });
//   }



async function load() {
  console.log("successful Metamask connection");
    await printAccount();
    await loadWeb3();
    window.contract = await loadContract();
    await getAllAccounts();
}

load();