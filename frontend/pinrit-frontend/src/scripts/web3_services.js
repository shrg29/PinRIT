
import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract = "0x70f0cEc50598a552464d561f93d12aa588A1422d"

let name = document.getElementById("name").value;
let description = document.getElementById("description").value;
let price = document.getElementById("price").value;
let fileURL = ""

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


export async function connectMetamask() {
    console.log("konektiran sam ")
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

//ovo se desi drugo
function uploadJSONToIPFS(JSONBody) {

  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //making axios POST request to Pinata ⬇️
  return axios.post(url, JSONBody, {
          headers: {
              pinata_api_key: "697b58916befdfdf20bb",
              pinata_secret_api_key: "a94852cfef4ce49665f7eeae6574311e920141117e664381fac1ffbe2b627a70",
          }
      })
      .then(function (response) {
         return {
             success: true,
             pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
         };
      })
      .catch(function (error) {
          console.log(error)
          return {
              success: false,
              message: error.message,
          }

  });
};

//ovo se desi prvo
function uploadFileToIPFS(file) {
const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append('file', file);

  const metadata = JSON.stringify({
      name: 'testname',
      keyvalues: {
          exampleKey: 'exampleValue'
      }
  });
  data.append('pinataMetadata', metadata);

  return axios 
      .post(url, data, {
          maxBodyLength: 'Infinity',
          headers: {
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
              pinata_api_key: '697b58916befdfdf20bb',
              pinata_secret_api_key: 'a94852cfef4ce49665f7eeae6574311e920141117e664381fac1ffbe2b627a70',
          }
      })
      .then(function (response) {
          console.log("image uploaded", response.data.IpfsHash)
          return {
             success: true,
             pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
         };
      })
      .catch(function (error) {
          console.log(error)
          return {
              success: false,
              message: error.message,
          }
  });
};


async function OnChangeFile(e) {
    console.log("slay")
    var file = e.target.files[0];
    //check for file extension
    try {
        //upload the file to IPFS
        const response = await uploadFileToIPFS(file);
        if(response.success === true) {
            console.log("Uploaded image to Pinata: ", response.pinataURL)
            fileURL = response.pinataURL
        }
    }
    catch(e) {
        console.log("Error during file upload", e);
    }
}

async function uploadMetadataToIPFS() {
  
    console.log("dog")

    name = document.getElementById("name").value;
    description = document.getElementById("description").value;
    price = document.getElementById("price").value;
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
  const element = document.getElementById("fileURL");
  element.addEventListener("change", OnChangeFile);
  
  function updateMessage(newMessage){
    document.getElementById("uploadMessage") = newMessage
  }

  function updateFormParams(newName, newDescription, newPrice) {
    name = newName
    description = newDescription
    price = newPrice
  }

  const addButton = document.getElementById("buttonUpload");
  addButton.addEventListener("click", uploadArtwork);

  async function getCurrentAccount() {
    const accounts = await window.web3.eth.getAccounts();
    return accounts[0];
}

  //TODO uploadArtwork
  async function uploadArtwork(e) {
    e.preventDefault();
    //Upload data to IPFS
    try {
        const metadataURL = await uploadMetadataToIPFS();
        let newPrice = ethers.utils.parseUnits(price, 'ether')
        // let newListingPrice
        // let listingPrice = await contract.methods.getListPrice().call().then(function (uint) {
        //     console.log(uint);
        //     newListingPrice = uint
        // })

        // window.web3.eth.getAccounts(function (err, accounts) {
        //     account = accounts[0];
        //     web3.eth.defaultAccount = account;
        // });

        // let etherValue = Web3.utils.fromWei(newListingPrice, 'ether');
        
        const account = await getCurrentAccount()

        let transaction = await window.contract.methods.mint(metadataURL, newPrice).send({value: web3.utils.toWei(String(0.001), 'ether'), from: account})
        await transaction.wait()

        //alert("Successfully listed your NFT!");
        updateMessage("");
        updateFormParams("", "", "");
    }
    catch(e) {
        // alert( "Upload error"+e )
        console.log("Upload error" + e)
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
    // console.log(contract)
    console.log(contract.methods)
    await getAllAccounts();
}

load();