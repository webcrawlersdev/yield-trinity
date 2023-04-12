export const SHARED_WALLET = [
    "function deposit() payable ",
    "function withdraw(uint256 amount)",
    "function borrow(uint256 amount)",
    "function borrowall()",
    "function repay() payable",
    "function banUser(address user)",
    "function unbanUser(address user)",
    "function transferOwnership(address payable newOwner)",
    "function bypassBan(address user)",
    "function rebalanceOwnershipPercentages()",
    "function isUserExist(address user) view returns (bool)",
    "function addUser(address user)",
    "function removeUser(address user)",
    "function updateUserOwnershipPercentage(address user)",

    "function ownershipPercentage(address user) public view returns (uint256)",
    "function availableForwithdrawal(address user) public view returns (uint256)",
    "function balances(address user) public view returns (uint256)",
    "function owner () public view returns (address)",


    "function getUserBorrowedAmount(address user) view returns (uint256)",
    "function getUserRepaidAmount(address user) view returns (uint256)",
    "function getUserPotentialEarn(address user) view returns (uint256)",
    "function getUserDilutedEarning(address user) view returns (uint256)",
    "function getUserAvailableForWithdrawal(address user) view returns (uint256)",
    "function isWhitelistedUser(address user) view returns (bool)",
    "function whitelistUser(address user)",
    "function removeWhitelistedUser(address user)",
    "function setWithdrawalFee(uint256 fee)"
]