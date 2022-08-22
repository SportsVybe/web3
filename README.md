## Inspiration
The inspiration came from wanting to find a way to connect people to recreational sports. Playing sports is a universal language and our platform will give enthusiasts a unique way to earn while being active. [StepN](https://www.stepn.com) brought to the community a "Run to Earn" concept that exploded in popularity. Our goal is to be the first "Play Sports to Earn" and allow an easy entry into web3. We believe the best innovations with the new technology will incorporate web3 elements without saying web3 or blockchain.

## What it does
**Earn VYBES**
 - Check-In to Parks, Facilities, or Events
 - Winning IRL challenges against other players or teams
 - Sponsored Airdrops to Upcoming Events

**Spend VYBES**
 - Challenge players or teams to an IRL sports match
 - Marketplace

**Positive Vybes**
 - Play IRL sports
 - Join an enthusiastic sports community
 - Get active!

## How we built it
We choose to build the project using Polygon, AWS, ChainLink, Moralis, NextJS, and TypeScript.

**Polygon** was selected for the low transaction rate and speed to ensure users are not impacted.

**AWS** was used for hosting the app using Amplify, Lambda, and DynamoDB to name a few of the services. The robust tooling and features that are offered in Amazon Web Services are exactly what our project needs for eventual scaling.

**Moralis** serves as the basis for delivering a web2 database as well as a web3 wallet management system. This allows us the flexibility to easily open our project to more people.

**Chainlink** VFR for generated random ID for on-chain values.

Also, we are exploring Keeper to add automation in the smart contract to enable auto-refunding a challenge creator after 24 hours if the challenge is not accepted.

[Contract Address: 0xeCABfa32f5A51007c47E2d1330ac904977CB4B6B](https://mumbai.polygonscan.com/address/0xeCABfa32f5A51007c47E2d1330ac904977CB4B6B)

[Token Address: 0x1E5FFB24f8b906cEd4c9c9139728e838A494bB00](https://mumbai.polygonscan.com/address/0xeCABfa32f5A51007c47E2d1330ac904977CB4B6B)

## Challenges we ran into
With this project we have embarked on many new challenges:

- The learning curve with new technologies with AWS, and Chainlink VRF. Despite the challenges with implementing the tech, we found that AWS was far superior to some of the other hosting and CI/CD options. Both AWS and Chainlink will allow our project to scale.

- We believe there is a market in the sports community for web3 tech. With NBA Topshot and other large brands embarking to integrate with web3 tech, we think that now is a great time. However, additionally, how do you build a web3 platform with sports? This challenge leads us to create the protocol that we call "Proof of Sportsmanship" or POS for short.

- Blockchain transactions can be slow at times and making users wait can create a negative experience. To handle this limitation and allow transactions to confirm, we created an action flow. The action flow allows the transaction to occur on the chain and stores the data in Moralis. When the transaction is confirmed (which could take 10 minutes) the database will be updated using the Moralis contract event monitor.

## Accomplishments that we're proud of
We believe this is a new sector that we are embarking on. We're proud of the smart contract development, and establishing a concept that is unique to the community. 

## What's next for SportsVybe
We plan to build the concept into a mobile application using react native. We are looking to partner with various local communities in the Miami, Florida area to bring sports leagues to the platform. 
Exciting roadmap items include:
- A marketplace to spend VYBES 
- Sponsored NFT Airdrops to challenges or events
- Allow teams to create NFTs for team members

Follow us on Twitter [@sportsvybe](https://www.twitter.com/SportsVybe) 
