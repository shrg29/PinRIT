//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract PinRIT is ERC721URIStorage {
 
    using Counters for Counters.Counter;
    Counters.Counter private _nftsSold;
    Counters.Counter private _tokenIDs;
    address payable owner; 
    uint256 listPrice = 0.001 ether;

    struct MintedNFT {
        uint256 tokenID;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

       event MintedNFTSuccess (
        uint256 indexed tokenID,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

     mapping(uint256 => MintedNFT) private IDToMintedNFT;

    constructor() ERC721("PinRIT", "NFT") {
        owner = payable(msg.sender); 
    }

    function mint(string memory tokenURI, uint256 price) public payable returns (uint) {
        _tokenIDs.increment();
        uint256 newTokenID = _tokenIDs.current();

        _safeMint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, tokenURI);
        createUploadedToken(newTokenID, price);

        return newTokenID;
    }

        function getListPrice() public view returns (uint256) {
        return listPrice;
    }

        function createUploadedToken(uint256 tokenID, uint256 price) private {
    
        require(msg.value == listPrice, "Insufficient funds");
        require(price > 0, "That should be greater than zero my friend");

  
        IDToMintedNFT[tokenID] = MintedNFT(
            tokenID,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenID);
       
        emit MintedNFTSuccess(
            tokenID,
            address(this),
            msg.sender,
            price,
            true
        );
    }

        function getAllNFTs() public view returns (MintedNFT[] memory) {
        uint nftCount = _tokenIDs.current();
        MintedNFT[] memory tokens = new MintedNFT[](nftCount);
        uint currentIndex = 0;

        for(uint i=0;i<nftCount;i++)
        {
            uint currentId = i + 1;
            MintedNFT storage currentItem = IDToMintedNFT[currentId];
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return tokens;
    }

    // Function to get all NFTs owned or sold by a specific address
    function myNFTs(address _address) public view returns (MintedNFT[] memory) {
        uint nftCount = _tokenIDs.current();
        MintedNFT[] memory myNFTsCount = new MintedNFT[](nftCount);

        for (uint i = 0; i < nftCount; i++) {
            if (IDToMintedNFT[i].seller == _address) {
                myNFTsCount[nftCount] = IDToMintedNFT[i];
                nftCount++;
            }
        }
        return myNFTsCount;
    }


    function buyNFT(uint256 tokenId) public payable {
       // uint price = IDToMintedNFT[tokenId].price;
        address seller = IDToMintedNFT[tokenId].seller;
       // require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        IDToMintedNFT[tokenId].currentlyListed = true;
        IDToMintedNFT[tokenId].seller = payable(msg.sender);
        _nftsSold.increment();
        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);
        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);
    }





        //get specific NFTs from current owner
     function getMyNFTs() public view returns (MintedNFT[] memory) {
        uint totalItemCount = _tokenIDs.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        
        for(uint i=0; i < totalItemCount; i++)
        {
            if(IDToMintedNFT[i+1].owner == msg.sender || IDToMintedNFT[i+1].seller == msg.sender){
                itemCount += 1;
            }
        }

        MintedNFT[] memory items = new MintedNFT[](itemCount);
        for(uint i=0; i < totalItemCount; i++) {
            if(IDToMintedNFT[i+1].owner == msg.sender || IDToMintedNFT[i+1].seller == msg.sender) {
                uint currentId = i+1;
                MintedNFT storage currentItem = IDToMintedNFT[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }


}