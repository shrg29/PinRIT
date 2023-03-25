import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract = "0xE87d9B72e7c3d26dA6ca684F2c8747E0c4a18869"

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


async function getAllNFTs() {

    let listOfUrls = ""
    //we are calling the contract method which returns the array of all nfts (info about owners, price and id)
    let transaction = await contract.methods.getAllNFTs().call().then(function (array) {
        let newTransaction = array
       // console.log("info s ugovora " + array)

        //go through everything from the array and based on the ID get the generated url
        return Promise.all(newTransaction.map(async i => {
            const tokenURI = await window.contract.methods.tokenURI(i.tokenID).call()
            //console.log(tokenURI)
            return tokenURI
        })).then(results => {
            listOfUrls = results
            // console.log("cijeli array " + results)
            return results
        })
    })
    return transaction

}


async function getInfo() {
    let listOfUrls = ""
    //we are calling the contract method which returns the array of all nfts (info about owner, price and id)
    let transaction = await contract.methods.getMyNFTs().call().then(function (array) {
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

           // let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
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



async function getMyNFTs() {
    let transaction = await contract.methods.getMyNFTs().call().then(function (array) {
        let newTransaction = array
        console.log(newTransaction)
    })
    console.log(transaction)
}

    //loads at page rendering
    async function load() {
        await loadWeb3();
        window.contract = await loadContract();
        await getInfo();
        await getMyNFTs();

            let listOfUrls = await getAllNFTs() // vraca sve urlove NFT-eva
        
            //console.log(listOfUrls)
            
            const responses = await Promise.all(listOfUrls.map(url => fetch(url).then(res => res.json())))
            
            const root = document.getElementById("nftData");
            for (const response of responses) {
                // const element = document.createElement('div');
                // element.innerHTML = card;
               // root.appendChild(element.firstChild);

                const img = document.createElement("img");
                img.src = response.image;
                root.appendChild(img);
            }
    }

    load();