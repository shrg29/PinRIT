import myJson from '../../../../Marketplace.json' assert {type: 'json'};

//let previous = "0xE87d9B72e7c3d26dA6ca684F2c8747E0c4a18869"
// let contract = "0xBA7c5F06EaD3Ad1c3B3B85Cc98DFcdaf51Af49B3"
let contract = "0xc91Dcf983AfBDb9f2f5ecc50ad9A7608D83c4e6D"

let name = document.getElementById("name").value;
let description = document.getElementById("description").value;
let price = document.getElementById("price").value;
let fileURL = ""
let fetched = false
let currentID = 0;
let currentPrice = 0;

//new code Ihor
let errorName = document.getElementById("name").nextElementSibling;
let errorPrice = document.getElementById("price").nextElementSibling;
let errorDescription = document.getElementById("description").nextElementSibling;

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

//ovo se desi drugo
function uploadJSONToIPFS(JSONBody) {

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata ⬇️
    return axios.post(url, JSONBody, {
        headers: {
            "Access-Control-Allow-Origin": "*",
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
                "Access-Control-Allow-Origin": "*",
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
    var file = e.target.files[0];
    //check for file extension
    try {
        //upload the file to IPFS
        const response = await uploadFileToIPFS(file);
        if (response.success === true) {
            console.log("Uploaded image to Pinata: ", response.pinataURL)
            fileURL = response.pinataURL;
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

    //new code Ihor
    //cleans error msgs
    errorName.innerHTML = "";
    errorPrice.innerHTML = "";
    errorDescription.innerHTML = "";

    //print error msg
    if (name.length == 0) {
        errorName.innerHTML += "- NFT name is required.<br/>";
    }else if (String(name).trim().length <= 2) {
        errorName.innerHTML += "- NFT name has to have at least three characters.<br/>";
    }
    if (description.length == 0) {
        errorDescription.innerHTML += "- Description is required.<br/>";
    }else if (String(description).trim().length <= 4) {
        errorDescription.innerHTML += "- Description has to have at least five characters.<br/>";
    }
    if (price.length == 0) {
        errorPrice.innerHTML += "- Price should be entered.<br/>";
    } else if (price < 0) {
        errorPrice.innerHTML += "- Price should be a positive value.<br/>";
    }
    //Make sure that none of the fields are empty
    if (!name || !description || !price || !fileURL)
        return;
    //new code Ihor

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
    // Show message to user
    const messageDiv = document.getElementById("msg-text");
    messageDiv.innerHTML = "Uploading artwork... Please wait.";
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
        messageDiv.innerHTML = "Upload successful!";
        window.location.reload();
    }
}
const buyButton = document.getElementById('buyButton')
buyButton.addEventListener('click', buyArtwork)

async function buyArtwork(resp) {

    const messageDiv = document.getElementById("msg-text");
    messageDiv.innerHTML = "Transaction ongoing... Please wait.";

    try {
        let info = await getInfo()
        console.log(resp)
        console.log(resp.tokenId)
        //vraca dosl ovak cijeli info
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'}), account = accounts[0];

        console.log(currentID)
        console.log(currentPrice)

        let price = Number(currentPrice)

            let transaction = await window.contract.methods.buyNFT(currentID).send({ from: account, gas: 3000000, value: web3.utils.toWei(String(0.000001), 'ether') }, function (err, res) { })
            await transaction.wait()
        } catch (error) {
            console.log("Buy error ", error)
            messageDiv.innerHTML = "You successfully purchased NFT!";
            window.location.reload();
        }
    }

function updateFetched(isFetched) {
        fetched = isFetched
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
                let meta = await axios.get(tokenURI, {
                    headers: {
                        'Accept': 'text/plain'
                    }
                });
                meta = meta.data;

                //let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    tokenId: i.tokenID,
                    price: i.price,
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                //console.log(item)
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
        console.log(resp)
        const el = document.getElementById("info");
        let textNode = document.createTextNode(JSON.stringify(resp));
        el.innerHTML =
            `
    <div class="info-form">
    <div class="circle-el">
    <img class="circle" src= ${resp.image} width=115 height=115/>
    </div>
    <h6>${resp.name}</h6>
    </div>
    <div class= "info-text"> 
    <p>Description: ${resp.description}</p>
    <p>Current owner: ${resp.seller}</p>
    <p> Price: ${resp.price} ETH</p>
    </div>
    `;
    }


    

    //loads at page rendering
    async function load() {
        await loadWeb3();
        window.contract = await loadContract();
        await getInfo();

        if (!fetched) {
            let info = await getInfo() //vraca dosl ovak cijeli info
            const root = document.getElementById("nftData");
            for (const response of info) {
                const img = document.createElement("img");
                img.src = response.image;
                img.id = response.image;
                img.addEventListener('click', function handleClick(event) {
                    currentID = response.tokenId
                    currentPrice = response.price
                    console.log(currentID)
                    appendInfo(response)
                });
                root.appendChild(img);
            }
            updateFetched(true)
        }

    }

    load();




