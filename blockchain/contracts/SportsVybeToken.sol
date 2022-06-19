// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*
@Description: DAPP token
*/
contract SportsVybeToken is ERC20 {
    constructor() ERC20("SportsVybe", "SVC") {
        _mint(msg.sender, 1000000000000000000000000);
    }
}
