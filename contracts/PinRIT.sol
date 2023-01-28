//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract PinRIT is ERC721URIStorage {
 
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;
    address payable contractOwner; 
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
        contractOwner = payable(msg.sender); 
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





}