# @atomic-trade/payments

A React package for handling payments and orders in your e-commerce application. This package provides a flexible and extensible payment processing system with support for multiple payment providers.

## Features

- 🛍️ E-commerce payment processing
- 💳 Multiple payment provider support
- 🔒 Secure payment handling
- ⚛️ React components for easy integration
- 📦 TypeScript support
- 🎨 Modern UI components with Heroicons and Lucide icons

## Installation

```bash
# Using npm
npm install @atomic-trade/payments

# Using yarn
yarn add @atomic-trade/payments

# Using pnpm
pnpm add @atomic-trade/payments
```

## Requirements

- Node.js >= 18.0.0
- React >= 19.0.0

## Usage

```tsx
import { PaymentProcessor } from "@atomic-trade/payments";

// Initialize the payment processor
const processor = new PaymentProcessor({
  // Your configuration here
});

// Process a payment
const result = await processor.processPayment({
  // Payment details
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run type checking
pnpm typecheck

# Format code
pnpm format:write

# Lint code
pnpm lint
```

## License

This project is licensed under the terms of the license included in the repository.

## Author

Andrew Hunn
