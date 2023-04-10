import myJson from '../../../../Marketplace.json' assert {type: 'json'};

let contract = "0xdf898fbc4b3cBfc2CD08C4BB577D55Ec7DA24f1c"

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
         console.log("info s ugovora " + array)

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




// Set up canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Geometry shape settings
const numShapes = 50;
const shapes = [];

// Create geometry shapes
for (let i = 0; i < numShapes; i++) {
  shapes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 50 + 10,
    speed: Math.random() + 0.5,
    color: '#6F4E9C',
  });
}

// Draw shapes onto canvas
function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  shapes.forEach((shape) => {
    ctx.beginPath();
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 3;
    ctx.rect(shape.x, shape.y, shape.size, shape.size);
    ctx.stroke();
  });
}

// Move shapes across canvas
function moveShapes() {
  shapes.forEach((shape) => {
    shape.x += shape.speed;
    if (shape.x > canvas.width + shape.size) {
      shape.x = 0 - shape.size;
      shape.y = Math.random() * canvas.height;
    }
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  drawShapes();
  moveShapes();
}

animate();



function appendInfo(resp) {
    const card = document.querySelector(".card:last-child");
  
    const nftName = document.createElement("p");
    nftName.textContent = resp.name;
    nftName.classList.add("info-text");
    
    const price = document.createElement("p");
    price.textContent = resp.price;
    price.classList.add("info-text");
    price.classList.add("price");

    const eth = document.createElement("p");
    eth.textContent = "ETH";
    eth.classList.add("info-text");

    card.appendChild(nftName);
    card.appendChild(eth);
    card.appendChild(price);
}




async function getMyNFTs() {
    let transaction = await contract.methods.getMyNFTs().call()
        console.log(transaction)


}
    //loads at page rendering
    async function load() {
        await loadWeb3();
        window.contract = await loadContract();
        //await getInfo();
       // await getMyNFTs();

            let listOfUrls = await getAllNFTs() // vraca sve urlove NFT-eva
        
            console.log(listOfUrls)
            
            const responses = await Promise.all(listOfUrls.map(url => fetch(url).then(res => res.json())))
            
            const root = document.getElementById("myNFTs");
            for (const response of responses) {
                const card = document.createElement("div");
                card.classList.add("card");
              
                const img = document.createElement("img");
                img.src = response.image;
              
                card.appendChild(img);
                root.appendChild(card);
                appendInfo(response)
            }
    }

    load();