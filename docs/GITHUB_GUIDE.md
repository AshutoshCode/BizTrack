# GitHub contribution Guide

We welcome contributions to BizTrack! Here's how you can help.

## Reporting Issues
If you find a bug or have a feature request, please open an issue on the GitHub repository.
- **Bug Reports**: excessive details are better. Include steps to reproduce, expected behavior, and screenshots if possible.
- **Feature Requests**: Describe the problem you are trying to solve and your proposed solution.

## Contributing Code

1. **Fork the Repository**:
   Click the "Fork" button on the top right of the repository page.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/your-username/biztrack.git
   cd biztrack
   ```

3. **Create a Branch**:
   Create a new branch for your feature or fix.
   ```bash
   git checkout -b feature/my-new-feature
   ```

4. **Make Changes**:
   Write your code and ensure everything works locally.

5. **Commit and Push**:
   ```bash
   git commit -m "Add some feature"
   git push origin feature/my-new-feature
   ```

6. **Create a Pull Request**:
   Go to the original repository and click "Compare & pull request". Describe your changes and submit.

## code Style
- We use Prettier and ESLint (default Next.js config) to maintain code quality.
- Run `npm run lint` before committing to catch any issues.
