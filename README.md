# 🗳️ Blockchain-Based Voting System

A secure, transparent, and privacy-preserving voting platform built during [Hackathon Name] using cutting-edge technologies like **Zero-Knowledge Proofs**, **Geo-Fenced Voting**, **MFA**, and **Smart Contracts**. This system ensures vote integrity, privacy, and verifiability for modern democratic processes.

## 🚀 Features

- ✅ **Multiple Voting Methods**  
  Supports Approval Voting, Ranked-Choice Voting, and Quadratic Voting.

- 🛡️ **Zero-Knowledge Proofs (ZKP)**  
  Ensures vote privacy using Merkle proof-based ZKP verification.

- 🌍 **Geo-Fenced Voting**  
  Restricts voting access based on the voter's location.

- 🔐 **Multi-Factor Authentication (MFA)**  
  Adds OTP-based voter authentication for enhanced security.

- ⚖️ **Smart Contract-Based Dispute Resolution**  
  Handles vote disputes fairly and transparently.

- 🏅 **NFT Voter Badges** *(Optional)*  
  Mintable voter certificates as NFTs after successful voting.

## 🧱 Architecture

- **Frontend**: Next.js 15 + Ethers.js v6  
- **Backend**: Django (for OTP and geo-auth integration)  
- **Smart Contracts**: Solidity (deployed on Sepolia Testnet)  
- **ZKP Verifier**: Merkle proof-based privacy-preserving validator  
- **Wallet Integration**: MetaMask

## 🧠 Tech Stack

| Layer         | Tech                                   |
|---------------|----------------------------------------|
| Frontend      | Next.js, TailwindCSS, Ethers.js v6     |
| Backend       | Django, Python                         |
| Smart Contracts | Solidity, Remix IDE, Sepolia Testnet |
| ZKP           | Merkle Trees, zk-SNARK concepts        |
| Tools         | MetaMask, Hardhat, Pinata (if NFT used)|

## ⚙️ Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/voting-system.git
cd voting-system
