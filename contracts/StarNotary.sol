// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
  constructor() ERC721("StarNotary", "STAR") {
  }

  struct Star {
    string name;
  }

  mapping(uint256 => Star) public tokenIdToStarInfo;
  mapping(uint256 => uint256) public starsForSale;

  function createStar(string memory _name, uint256 _tokenId) public {
    Star memory newStar = Star(_name);
    tokenIdToStarInfo[_tokenId] = newStar;
    _mint(msg.sender, _tokenId);
  }

  function putStarForSale(uint256 _tokenId, uint256 _price) public {
    require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't own");
    starsForSale[_tokenId] = _price;
  }

  function buyStar(uint256 _tokenId) public payable {
    require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

    uint256 starCost = starsForSale[_tokenId];
    address starOwner = ownerOf(_tokenId);

    require(msg.value >= starCost);

    transferFrom(starOwner, msg.sender, _tokenId);

    address payable ownerAddress = payable(starOwner);

    ownerAddress.transfer(starCost);

    if (msg.value > starCost) {
      payable(msg.sender).transfer(msg.value - starCost);
    }
  }
}
