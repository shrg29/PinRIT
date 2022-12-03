const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
    //deploying contract
    const contract = await hre.ethers.getContractFactory("MVP");
    const initialContract = await contract.deploy();
    await initialContract.deployed();
    console.log("Contract for MVP deployed to:", initialContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });