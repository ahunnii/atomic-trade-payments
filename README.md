# @atomic-trade/payments

A React package for handling payments and orders in your e-commerce application. This package provides a flexible and extensible payment processing system with support for multiple payment providers.

## Features

- 🛍️ E-commerce payment processing for Next.js applications
- 💳 Multiple payment provider support (Stripe, etc.)
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

## Environment Variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - The publishable key for the Stripe API
- `STRIPE_SECRET_KEY` - The secret key for the Stripe API
- `NEXT_PUBLIC_HOSTNAME` - The hostname of the store (i.e. `https://example.com`)
- `NEXT_PUBLIC_STORAGE_URL` - The URL of the storage service (i.e. `https://storage.example.com`)
- `STRIPE_WEBHOOK_SECRET` - The webhook secret for the Stripe API

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
