# how to install and set up
node version is `22.13.1`

## starting
1. `npm i`
2. copy `.env.example` and rename to `.env`, and add your keys (infura key is optional)
3. run `clean:compile`

run `test` for tests (optionally)

## deploying
1. local
   - `npx hardhat node` to run local node
   - `npm run deploy:local` to deploy local
2. sepolia
   - `npm run deploy:sepolia`

