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

    constructor() ERC721("PinRIT", "NFT") {
        contractOwner = payable(msg.sender); 
    }

    function mint(string memory tokenURI, uint256 price) public payable returns (uint) {
        _tokenIDs.increment();
        uint256 newTokenID = _tokenIDs.current();

        _safeMint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, tokenURI);

        return newTokenID;
    }





}