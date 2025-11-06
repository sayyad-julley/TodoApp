# {{ __APP_NAME__ }}

{{ description }}

## Getting Started

This is a React application created with Vite, TypeScript, and modern development tools.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

### Tech Stack

{{#if useTypeScript}}
- **TypeScript** - Type safety and better developer experience
{{/if}}
- **React {{ reactVersion }}** - UI library
- **Vite** - Fast build tool and development server
{{#if useRouter}}
- **React Router** - Client-side routing
{{/if}}
{{#if useStateManagement}}
- **{{ useStateManagement }}** - State management
{{/if}}
{{#if uiFramework}}
- **{{ uiFramework }}** - UI component library
{{/if}}
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Testing framework
- **Storybook** - Component development and documentation

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── styles/        # Global styles and CSS modules
└── App.tsx        # Main application component
```

### Development

The application is configured with hot module replacement (HMR) for fast development. Changes to your code will be reflected immediately in the browser.

### Testing

Tests are written using Vitest and React Testing Library. You can run tests in watch mode with `npm run test` or view the test UI with `npm run test:ui`.

### Storybook

Storybook is configured for component development and documentation. Run `npm run storybook` to start the Storybook server.

### Deployment

The application can be deployed to any static hosting service. The build output is generated in the `dist/` directory when you run `npm run build`.

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
{{#if (eq uiFramework 'ant-design')}}
- [Ant Design Documentation](https://ant.design/)
{{/if}}
{{#if (eq uiFramework 'material-ui')}}
- [Material-UI Documentation](https://mui.com/)
{{/if}}
{{#if (eq uiFramework 'chakra-ui')}}
- [Chakra UI Documentation](https://chakra-ui.com/)
{{/if}}
{{#if (eq uiFramework 'tailwind')}}
- [Tailwind CSS Documentation](https://tailwindcss.com/)
{{/if}}