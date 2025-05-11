# ThoughtWeb Navigator

An AI-powered second brain application that helps users collect, organize, and extract insights from their knowledge sources.

## Project Overview

ThoughtWeb Navigator is a unified knowledge management system that leverages AI to help users make sense of their information. The application allows users to:

- Import knowledge from various sources (text, PDFs, websites, etc.)
- Organize information automatically using AI
- Query their knowledge base using natural language
- Extract insights and connections between different pieces of information
- Collaborate with others on shared knowledge bases (premium feature)

## Documentation

This repository contains comprehensive documentation for implementing ThoughtWeb Navigator as a unified, deployable product with integrated payment functionality:

### Getting Started

- [**Quick Start Guide**](./quick_start_guide.md) - Condensed instructions to quickly get started with implementation
- [**Documentation Index**](./documentation_index.md) - A central reference for all documentation

### Implementation Documents

- [**Unified Product Strategy**](./unified_product_strategy.md) - Comprehensive business strategy
- [**Integration Plan**](./integration_plan.md) - Strategy for unifying the project
- [**Payment Integration**](./payment_integration.md) - Technical specifications for Stripe integration
- [**Stripe Implementation**](./stripe_implementation.md) - Code snippets and implementation details
- [**Deployment Guide**](./deployment_guide.md) - Step-by-step deployment instructions
- [**Implementation Summary**](./implementation_summary.md) - High-level implementation overview
- [**Project Completion**](./project_completion.md) - Summary of work completed and next steps

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payment Processing**: Stripe
- **Deployment**: Vercel/Netlify/GitHub Pages

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 5 sources, Basic models, 100 queries/month |
| Standard | $9.99/month | 50 sources, Standard models, 1,000 queries/month |
| Premium | $19.99/month | Unlimited sources, All models, 5,000 queries/month |
| Enterprise | Custom | Custom limits, Dedicated support, Team features |

## Implementation Workflow

For the most efficient implementation, we recommend following this workflow:

1. **Planning Phase**:
   - Review the [Unified Product Strategy](./unified_product_strategy.md)
   - Understand the [Integration Plan](./integration_plan.md)

2. **Setup Phase**:
   - Follow the [Quick Start Guide](./quick_start_guide.md) for initial setup
   - Configure database according to [Payment Integration](./payment_integration.md)

3. **Development Phase**:
   - Implement Stripe integration using [Stripe Implementation](./stripe_implementation.md)
   - Develop frontend components for subscription management

4. **Deployment Phase**:
   - Follow the [Deployment Guide](./deployment_guide.md) for production deployment
   - Set up monitoring and analytics

5. **Post-Launch Phase**:
   - Implement usage tracking
   - Add analytics
   - Create onboarding flow
   - Gather user feedback

## Project Structure

```
thoughtweb-navigator/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   ├── llm/          # LLM-related components
│   │   ├── query/        # Query interface components
│   │   ├── sources/      # Source management components
│   │   └── ui/           # UI components (shadcn/ui)
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and libraries
│   └── pages/            # Page components
├── .env.local            # Environment variables (create from .env.example)
├── package.json          # Project dependencies
└── vite.config.ts        # Vite configuration
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thoughtweb-navigator.git
   cd thoughtweb-navigator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your environment variables (see `.env.example`).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:8080](http://localhost:8080) to view the application.

## Deployment

Follow the [Deployment Guide](./deployment_guide.md) for detailed instructions on deploying ThoughtWeb Navigator to production.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
