export const SHARED_WALLET = [
    "function deposit() payable ",
    "function withdraw(uint256 amount)",
    "function borrowall()",

    "function getLastPair() public view returns (address pair)",
    "function ownershipPercentage(address user) public view returns (uint256)",
    "function conspectus(address user) public view returns (uint256)",
    "function contribute(address user) public view returns (uint256)",
    "function owner () public view returns (address)",
    "function withdrawalFee () public view returns (uint256)",
    "function dilutedEarning(address user) view returns (uint256)",
    "function getTokensLiquidity( address _token1,  address _token2 ) public view returns (uint256 token1, uint256 token2)",
    "function getTokenPairReserves(address pairAddress) public  view returns (uint256 token0Reserve, uint256 reserve1Reserve)",
    "function getTokenFromPair( address pair  ) public view returns (address tokenAddress, bool isValid)",
    "function getTokenPriceInWETH( address _token  ) public view returns (uint256 priceInWETH)",
    " function getTokenPriceInUSDT(  address _token  ) public view returns (uint256 priceInUSDT)",
    "function decimals() public view returns (uint256)",
    "function name() public view returns (string memory)",
    "function symbol() public view returns (string memory)",
    "function hasLiquidity(  address _token1,  address _token2  ) public view returns(bool hasliquidity) "
]