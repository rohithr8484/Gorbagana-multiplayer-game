# GOR Rush - Multiplayer Token Collection Game

A competitive, real-time multiplayer mini-game built on Gorbagana's Solana-based infrastructure. Players compete to collect falling GOR tokens in fast-paced battles.

## 🎮 Game Overview

GOR Rush is a reaction-based multiplayer game where players compete to collect falling GOR tokens. The game features:

- **Real-time multiplayer gameplay** with up to 4 players per match
- **Multiple game modes**: Blitz Rush (60s), Endurance Race (5min), Tournament (elimination)
- **GOR token integration** for entry fees, rewards, and scoring
- **Live leaderboards** with global rankings
- **Beautiful modern UI** with particle effects and smooth animations

## 🔗 Gorbagana Integration

### Testnet Configuration
- **Network**: Solana Testnet
- **Token**: GOR (Gorbagana native test token)
- **Wallet**: Backpack Wallet support

### Token Usage
- **Entry Fees**: Pay GOR tokens to join games
- **Rewards**: Earn GOR tokens based on performance
- **Scoring**: Collect GOR tokens during gameplay
- **Leaderboards**: Rankings based on GOR token accumulation

### Game Economy
- Blitz Rush: 10 GOR entry → 50 GOR reward (winner)
- Endurance Race: 25 GOR entry → 150 GOR reward (winner)
- Tournament: 50 GOR entry → 500 GOR reward (winner)

## 🚀 Features

### Core Gameplay
- **Token Collection**: Click falling GOR tokens to collect them
- **Real-time Competition**: Compete against other players live
- **Multiple Token Types**: Different values (1, 5, 10, 25 GOR)
- **Particle Effects**: Visual feedback for collections
- **Live Scoring**: Real-time score updates and rankings

### Wallet Integration
- **Backpack Wallet**: Native support for Backpack wallet
- **Automatic Balance**: Real-time GOR balance updates
- **Transaction History**: View all game-related transactions
- **Secure Payments**: All transactions handled through Solana

### Social Features
- **Global Leaderboards**: Daily, weekly, and all-time rankings
- **Live Activity Feed**: See other players' achievements
- **Player Profiles**: Track stats and progress
- **Achievement System**: Unlock rewards and milestones

## 🛠 Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom animations
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Wallet Adapter (Backpack)
- **State Management**: React Context API
- **Icons**: Lucide React

## 🏃‍♂️ How to Run Locally

### Prerequisites
- Node.js 18+ installed
- Backpack wallet browser extension
- Some SOL for testnet transactions

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd gor-rush-game
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Setup Instructions
1. **Install Backpack Wallet**: Add the Backpack wallet extension to your browser
2. **Switch to Testnet**: Configure your wallet to use Solana Testnet
3. **Get Test SOL**: Use a Solana testnet faucet to get test SOL
4. **Connect Wallet**: Click "Connect Wallet" in the game
5. **Start Playing**: Choose a game mode and start collecting tokens!

## 🎯 Game Modes

### Blitz Rush (60 seconds)
- **Duration**: 60 seconds
- **Entry Fee**: 10 GOR
- **Objective**: Collect as many tokens as possible
- **Rewards**: Winner takes 50 GOR

### Endurance Race (5 minutes)
- **Duration**: 5 minutes
- **Entry Fee**: 25 GOR
- **Objective**: Maintain high collection rate
- **Rewards**: Winner takes 150 GOR

### Tournament (Elimination)
- **Format**: Multiple rounds with elimination
- **Entry Fee**: 50 GOR
- **Objective**: Survive each round
- **Rewards**: Last player standing wins 500 GOR

## 🏆 Scoring System

- **Basic Tokens**: 1 GOR (Yellow)
- **Bonus Tokens**: 5 GOR (Blue)
- **Premium Tokens**: 10 GOR (Purple)
- **Legendary Tokens**: 25 GOR (Red)

## 🔒 Security Features

- **Anti-cheat**: Server-side validation of all game results
- **Secure Transactions**: All payments processed through Solana
- **Rate Limiting**: Prevents spam and abuse
- **Fair Play**: Randomized token generation ensures fairness

## 📊 Demo Access

The game is deployed and accessible at: [Live Demo URL]

To test the game:
1. Visit the demo URL
2. Connect your Backpack wallet (testnet mode)
3. Ensure you have test GOR tokens
4. Join a game and start playing!

## 🤝 Contributing

This project is part of the Gorbagana hackathon submission. The game demonstrates:
- Creative use of GOR tokens for game mechanics
- Seamless Solana/Gorbagana integration
- Competitive multiplayer gameplay
- Modern web3 gaming experience

## 📄 License

This project is submitted for the Build Multiplayer Mini-Games on Gorbagana Testnet
by Gorbagana Chain and follows the competition guidelines.

---

**Built with ❤️ for the Gorbagana community**
