//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract MVP{
 
  //initial returning function 
    function greeting() public pure returns (string memory) {
        return "Congratulations! You have succesfully made a connection with Ethereum blockchain.";
    }

}