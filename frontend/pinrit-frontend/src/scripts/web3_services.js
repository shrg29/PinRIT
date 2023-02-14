
import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract = "0xE8b3931Ac0C191df173111B5798A57Cff6bDc449"

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

function getAccount() {
    return localStorage.getItem("wallet-address");
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
        if (response.success === true) {
            console.log("Uploaded image to Pinata: ", response.pinataURL)
            fileURL = response.pinataURL
        }
    }
    catch (e) {
        console.log("Error during file upload", e);
    }
}

async function uploadMetadataToIPFS() {

    name = document.getElementById("name").value;
    description = document.getElementById("description").value;
    price = document.getElementById("price").value;
    //Make sure that none of the fields are empty
    if (!name || !description || !price || !fileURL)
        return;

    const nftJSON = {
        name, description, price, image: fileURL
    }

    try {
        //upload the metadata JSON to IPFS
        const response = await uploadJSONToIPFS(nftJSON);
        if (response.success === true) {
            console.log("Uploaded JSON to Pinata: ", response)
            return response.pinataURL;
        }
    }
    catch (e) {
        console.log("error uploading JSON metadata:", e)
    }
}
const element = document.getElementById("fileURL");
element.addEventListener("change", OnChangeFile);

function updateMessage(newMessage) {
    document.getElementById("uploadMessage") = newMessage
}

function updateFormParams(newName, newDescription, newPrice) {
    name = newName
    description = newDescription
    price = newPrice
}


//UPLOAD ARTWORK
const addButton = document.getElementById("buttonUpload");
addButton.addEventListener("click", uploadArtwork);

async function uploadArtwork(e) {
    e.preventDefault();

    try {
        const metadataURL = await uploadMetadataToIPFS();
        let newPrice = document.getElementById("price").value;
        await window.ethereum.enable();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        let transaction = await window.contract.methods.mint(metadataURL, newPrice).send({ from: account, gas: 3000000, value: web3.utils.toWei(String(0.001), 'ether') }, function (err, res) { })
        await transaction.wait()
    }
    catch (e) {
        alert("Succesfully uploaded artwork!")
        load();
        console.log("Upload error" + e)
    }
}

function updateImages(items) {
    nftData = items
}

function updateFetched(isFetched) {
    fetched = isFetched
}

//this actually gets all images of the NFTs
async function getAllNFTs() {
    let listOfUrls = ""
    //we are calling the contract method which returns the array of all nfts (info about owners, price and id)
    let transaction = await contract.methods.getAllNFTs().call().then(function (array) {
        let newTransaction = array

        //go through everything from the array and based on the ID get the generated url
        return Promise.all(newTransaction.map(async i => {
            const tokenURI = await window.contract.methods.tokenURI(i.tokenID).call()

            return tokenURI
        })).then(results => {
            listOfUrls = results
            // console.log(listOfUrls)
            return results
        })
    })
    return transaction

}

//vraca cijeli info i stavlja ga u array
async function getInfo() {
    let listOfUrls = ""
    //we are calling the contract method which returns the array of all nfts (info about owner, price and id)
    let transaction = await contract.methods.getAllNFTs().call().then(function (array) {
        let newTransaction = array

        //go through everything from the array and based on the ID get info 
        return Promise.all(newTransaction.map(async i => {
            const tokenURI = await window.contract.methods.tokenURI(i.tokenID).call()
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                tokenId: i.tokenID,
                price,
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            console.log(item)
            return item;

            return tokenURI
        })).then(results => {
            listOfUrls = results
            // console.log(listOfUrls)
            return results
        })
    })
    return transaction
}

function appendInfo(resp) {
    const el = document.getElementById("info");
    let textNode = document.createTextNode(JSON.stringify(resp));
    el.innerHTML = 
    `<p>Name of NFT: ${resp.name}</p>
    <img src= ${resp.image} width=100 height=100/>
    <p> Price: ${resp.price} ETH</p>
    <p>Owner: ${resp.owner}</p>
    <p>Seller: ${resp.seller}</p>`;
}

//loads at page rendering
async function load() {

    await printAccount();
    await loadWeb3();
    window.contract = await loadContract();
    await getAllAccounts();
    await getAllNFTs();
    //await getInfo();


    if (!fetched) {
        let listOfUrls = await getAllNFTs() // vraca sve urlove NFT-eva
        let info = await getInfo() //vraca dosl ovak cijeli info
        //   console.log(listOfUrls)
        //prodje kroz sve slike, fetcha ih i zaljepi na front
        const responses = await Promise.all(listOfUrls.map(url => fetch(url).then(res => res.json())))
        const root = document.getElementById("nftData");
        for (const response of responses) {

            const img = document.createElement("img");
            img.src = response.image;
            img.id = response.image;
            img.addEventListener('click', function handleClick(event) {
                appendInfo(response)
            });
            root.appendChild(img);
        }
        updateFetched(true)
    }

}

load();




