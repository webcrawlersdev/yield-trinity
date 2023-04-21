export const SHARED_WALLET = [
    "function deposit(uint256 _lockPeriod) payable ",
    "function withdraw(uint256 amount)",
    "function borrowall()",

    "function getLastPair() public view returns (address pair)",
    "function ownershipPercentage(address user) public view returns (uint256)",
    "function conspectus(address user) public view returns (uint256)",
    "function minLockPeriod() public view returns (uint256)",
    "function lockMyFunds(address _accoount)  public view returns (uint256)",
    "function contribute(address user) public view returns (uint256)",
    "function owner () public view returns (address)",
    "function withdrawalFee () public view returns (uint256)",
    "function dilutedEarning(address user) view returns (uint256)",
    "function potentialEarn(address user) view returns (uint256)",
    "function getTokensLiquidity( address _token1,  address _token2 ) public view returns (uint256 token1, uint256 token2)",
    "function getTokenPairReserves(address pairAddress) public  view returns (uint256 token0Reserve, uint256 reserve1Reserve)",
    "function getTokenFromPair( address pair  ) public view returns (address tokenAddress, bool isValid)",
    "function getTokenPriceInWETH( address _token  ) public view returns (uint256 priceInWETH)",
    " function getTokenPriceInUSDT(  address _token  ) public view returns (uint256 priceInUSDT)",
    "function decimals() public view returns (uint256)",
    "function name() public view returns (string memory)",
    "function symbol() public view returns (string memory)",
    "function hasLiquidity(  address _token1,  address _token2  ) public view returns(bool hasliquidity)"
]

export const PRICE_ORACLE = [
    "function quotes(address _router, address _token1, address _token2, address _factory, uint256 _amount) external view returns(uint256 currentPrice)",
    "function quoteByPair(address _router, address _pair, uint256 _amount, address _factory) external view returns(uint256 currentQuote)",
    "function getPathForToken(address tokenIn, address tokenOut) external pure returns(address[] memory)",
    "function getLastPrice(address _token1, address _token2, address _route, address _factory) external view returns(uint256 lastRate)",
    "function priceInWETH(address _token, address _router, address _factory) external view returns(uint256 price)",
    "function priceInUSDT(address _token, address _router, address _factory) external view returns(uint256 price)",
    "function getLastPair(address _factory) external view returns(address pair)",
    "function predictFuturePrices(address[] calldata routes, address[] calldata path, uint256 amountIn) external view returns(uint256[] memory prices)",
    "function _predictPrice(address _route, address[] memory path, uint256 _amount) external view returns(uint256 price)",
]