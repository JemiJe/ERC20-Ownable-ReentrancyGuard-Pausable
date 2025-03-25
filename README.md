
# SST Token
An ERC-20 token with advanced security and management features, designed for seamless transactions with built-in governance.

## ✨ Features
- **🚀 Fixed Supply:** 1,000,000 STT minted at deployment.
- **🔒 Security & Control:**  
  - Owner-controlled **pausable transfers** to prevent suspicious activities.  
  - **Blacklist system** to restrict malicious actors.  
  - **Reentrancy protection** for added security.  
- **💸 Transaction Fees:**  
  - 2% fee per transfer, automatically sent to a designated **fee wallet**.  
- **🔥 Minting & Burning:**  
  - Owner can **mint** new tokens.  
  - Anyone can **burn** their own tokens to reduce supply.

## 🔗 Deployment
- **Network:** Sepolia (Testnet)  
- **Token Symbol:** STT  
- **Contract Address:** [`0xDc6850463AdC192D34505c1d1261ab6BBFa311eb`](https://sepolia.etherscan.io/address/0xDc6850463AdC192D34505c1d1261ab6BBFa311eb)

## node
- node version is `22.13.1`

## prepare
1. `npm i`
2. copy `.env.example` and rename to `.env`, and add your keys (infura key is optional)
3. run `clean:compile`
4. run `npm run test` for tests (optionally)

## deploying
1. local
   - `npx hardhat node` to run local node
   - `npm run deploy:local` to deploy local
2. sepolia
   - `npm run deploy:sepolia`
   - validation command will be shown after deploy

## interaction script commands
1. Get total supply
```
npx hardhat interact --command total-supply --network sepolia
```
2. Check balance
```
npx hardhat interact --command balance "0xYourAddress" --network sepolia
```
3. Transfer tokens
```
npx hardhat interact --command transfer "0xRecipientAddress" 10 --network sepolia
```
4. Blacklist/unblacklist an address (address, true/false)
```
npx hardhat interact --command blacklist "0xAddress" true --network sepolia
```
5. Pause/unpause the contract (true/false)
```
npx hardhat interact --command pause true --network sepolia
```

