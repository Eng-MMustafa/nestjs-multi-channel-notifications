# Contributing to NestJS Multi-Channel Notifications

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Environment details** (Node.js version, NestJS version, OS)
- **Code samples** if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- Include code examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits atomic and well-described

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone your fork
git clone https://github.com/your-username/nestjs-multi-channel-notifications.git
cd nestjs-multi-channel-notifications

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
src/
├── channels/          # Channel implementations
├── interfaces/        # TypeScript interfaces
├── messages/          # Message classes
├── responses/         # Response classes
├── services/          # Core services
├── notification.module.ts
└── index.ts          # Public API exports

examples/             # Usage examples
```

## Coding Standards

### TypeScript Style

- Use TypeScript for all code
- Follow existing formatting conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write unit tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions

Example test structure:

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(channels): add Viber channel support

fix(email): handle attachment errors gracefully

docs(readme): update installation instructions
```

## Adding a New Channel

To add a new notification channel:

1. **Create the channel class** in `src/channels/`:

```typescript
import { Injectable } from '@nestjs/common';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';

@Injectable()
export class NewChannel implements ChannelInterface {
  constructor(private config: NewChannelConfig) {}

  async send(recipient: string, message: NotificationMessage): Promise<NotificationResponse> {
    // Implementation
  }

  validateRecipient(recipient: string): boolean {
    // Validation logic
  }

  getName(): string {
    return 'new-channel';
  }

  isConfigured(): boolean {
    // Check configuration
  }
}
```

2. **Add configuration interface** in `src/interfaces/notification-config.interface.ts`:

```typescript
export interface NewChannelConfig {
  apiKey: string;
  // Other config options
}
```

3. **Update the module** in `src/notification.module.ts`:

```typescript
// Add to forRoot method
if (options.newChannel) {
  channelProviders.push({
    provide: NewChannel,
    useFactory: () => new NewChannel(options.newChannel),
  });
}
```

4. **Write tests** in `src/channels/__tests__/new-channel.spec.ts`

5. **Update documentation**:
   - README.md - Add usage examples
   - CHANGELOG.md - Document the new feature

6. **Export the channel** in `src/index.ts`

## Documentation

When adding or changing features:

- Update README.md with examples
- Update API documentation
- Add JSDoc comments to public APIs
- Update CHANGELOG.md

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🙏
