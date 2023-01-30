
import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract = "0x274374bE9BFc574ce57224526d6C5729E97dc992"

let name = document.getElementById("name").value;
let description = document.getElementById("description").value;
let price = document.getElementById("price").value;
let fileURL = ""
let nftData
let fetched = false

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
    console.log("My Metamask address: " + account)
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


  //TODO uploadArtwork
  async function uploadArtwork(e) {
    e.preventDefault();
    //Upload data to IPFS
    try {
        const metadataURL = await uploadMetadataToIPFS();
       let newPrice = document.getElementById("price").value;
       await window.ethereum.enable();
       const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
       const account = accounts[0];

        let transaction = await window.contract.methods.mint(metadataURL, newPrice).send({from: account, gas: 3000000, value: web3.utils.toWei(String(0.001),'ether')}, function(err, res){})
        await transaction.wait()

        alert("Successfully listed your NFT!");
        updateMessage("");
        updateFormParams("", "", "");
    }
    catch(e) {
        // alert( "Upload error"+e )
        console.log("Upload error" + e)
    }
}

function updateImages(items){
    nftData = items
}

function updateFetched(isFetched){
    fetched = isFetched
}

//TODO get all NFT's
async function getAllNFTs(){

    let listOfUrls = ""

    let transaction = await contract.methods.getAllNFTs().call().then(function (array) {
        //console.log(JSON.stringify(array));
    
       let newTransaction = array
        
     //   console.log(contract.methods)
        return Promise.all(newTransaction.map(async i => {
            console.log("Ovo povucem za svaki token: " + i)
           const tokenURI = await window.contract.methods.tokenURI(i.tokenID).call()
           
            //radi
            //console.log(tokenURI)
          //  const tokenURI = 'https://gateway.pinata.cloud/ipfs/QmXQyyzqJezG8SjtufbFvpQsQmGyMjTUKbJHgZk5k5oNeL'
           
            //let meta = await axios.get(tokenURI, {withCredentials: false});
          //  let meta = await
            
          return tokenURI
        })).then(results => {
            listOfUrls = results
            return results
         //   let pictures = results.map( singleurl => {

               // console.log()
            // let meta =  axios.get(results[0], {withCredentials: false}).then(results => {
            //             console.log(results.data)
            //         })
            // }

            // )

        })

        // updateFetched(true)
        // updateImages(items)

        })
return transaction
       // console.log(transaction)
        // let meta =  axios.get(listOfUrls[0], {withCredentials: false}).then(results => {
        //     console.log(results.data)
        // })

}

async function test() {

   let test =  await contract.methods.getAllNFTs().call()
   console.log("IM HEREEEEWEE" + test)
}



// const [dataFetched, updateFetched] = useState(false);

// async function displayNFTs() {

//         let transaction = await contract.methods.getAllNFTs().call().then(function (array) {
//           console.log(JSON.stringify(array));
//            })


//     //Fetch all the details of every NFT from the contract and display
//     const items = await Promise.all(transaction.map(async i => {
//         const tokenURI = await contract.tokenURI(i.tokenId);
//         let meta = await axios.get(tokenURI);
//         meta = meta.data;

//         let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
//         let item = {
//             price,
//             tokenId: i.tokenId.toNumber(),
//             seller: i.seller,
//             owner: i.owner,
//             image: meta.image,
//             name: meta.name,
//             description: meta.description,
//         }
//         return item;
//     }))

//     updateFetched(true);
//     updateData(items);
// }

// if(!dataFetched)
//     getAllNFTs();




 async function load() {
//             const tokenURI = 'https://gateway.pinata.cloud/ipfs/QmXQyyzqJezG8SjtufbFvpQsQmGyMjTUKbJHgZk5k5oNeL'
//            let meta = await axios.get(tokenURI, {withCredentials: false});
// console.log(meta.data)

//   console.log("successful Metamask connection");
    await printAccount();
    await loadWeb3();
    window.contract = await loadContract();
    // console.log(contract)
    await getAllAccounts();
    if(!fetched) {
        let listOfUrls = await getAllNFTs() // vraca sve urlove NFT-eva
        
        console.log(listOfUrls)

        let actualUrl = 'https://gateway.pinata.cloud/ipfs/QmSqYgYMG9kAvp4d9Xna384TzSiyvuwgDC14VAX4z1uUat'
        let newEst = 'https://gateway.pinata.cloud/ipfs/QmVaaN3AkuZAQPLYmR3WvM7sq7Yig8JHwt54oXVatDbEVX'
        let tokenURI = 'https://gateway.pinata.cloud/ipfs/QmXQyyzqJezG8SjtufbFvpQsQmGyMjTUKbJHgZk5k5oNeL' // - ovaj radi
        console.log(tokenURI)
        // ovdje je Promise izgelda overloaded - ovo pada
      await axios.get(tokenURI, {withCredentials: false}).then(results => {
            console.log(results.data)
                  updateFetched(true)
         updateImages(results.data)
//updateData(results.data);
        })

        const img = document.querySelector("img"); 
       img.src = nftData.image;
      document.getElementById("nftData").appendChild(img)
    }
  // await test()
}

load();