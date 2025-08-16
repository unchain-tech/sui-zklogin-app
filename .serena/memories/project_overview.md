# Project Overview: Sui zkLogin Demo

## Purpose
This is an educational web application that demonstrates the complete Sui zkLogin authentication flow. It breaks down the complex zkLogin process into 7 interactive steps, allowing users to understand and experiment with each phase of the authentication process.

## Key Features
- **Interactive Demo**: Step-by-step walkthrough of zkLogin authentication
- **Educational Focus**: Code snippets and explanations for each step
- **Google OAuth Integration**: Uses Google as the OpenID provider
- **Sui Devnet Integration**: Connects to Sui blockchain devnet for real transactions
- **Multi-language Support**: English and Chinese interface
- **Browser-based Storage**: Uses sessionStorage and localStorage for key data

## The 7 Steps of zkLogin
1. Generate ephemeral key pair
2. Fetch JWT (from Google OAuth)
3. Decode JWT
4. Generate salt (for user privacy)
5. Generate user Sui address
6. Fetch ZK proof (from Mysten Labs proving service)
7. Assemble zkLogin signature and execute transaction

## Architecture
- **Frontend-only Application**: No backend server required
- **Client-side Key Management**: All cryptographic operations in browser
- **External Dependencies**: Google OAuth, Mysten Labs ZK proving service, Sui Devnet
- **Data Persistence**: Uses browser storage for maintaining state across steps

## Target Environment
- **Blockchain Network**: Sui Devnet
- **Deployment**: Vercel (https://sui-zklogin.vercel.app)
- **Browser Requirements**: Modern browsers with localStorage/sessionStorage support