# Repo Gardener

**Repo Gardener** is a GitHub Action designed to help maintain clean and organized repositories by monitoring inactive branches. This tool scans for branches that have been inactive for a specified duration (based on the last commit date) and automatically opens a pull request for each branch. The branch creator is assigned as the reviewer, allowing them to either merge their work or close the PR and delete the branch, ensuring your repository remains streamlined and clutter-free.

## Features
- Scans branches for inactivity based on the number of days since the last commit.
- Ignores protected branches and branches that already have an open pull request.
- Creates a pull request for each inactive branch targeting the base branch.
- Assigns the branch creator as the reviewer for the PR.
- Provides a customizable inactivity threshold and base branch.

## Usage
To use **Repo Gardener**, add it to your workflow file:

```yaml
name: "Run Repo Gardener"
on:
  schedule:
    - cron: '0 0 * * 0' # Runs weekly
  workflow_dispatch:

jobs:
  repo-gardener:
    runs-on: ubuntu-latest
    steps:
      - name: Run Repo Gardener
        uses: arminbro/repo-gardener@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          inactive_days: 30
          base_branch: main
```

## Inputs

| Name           | Description                                                                      | Required | Default |
|----------------|----------------------------------------------------------------------------------|----------|---------|
| `repo-token`   | GitHub token for authentication, typically set to `${{ secrets.GITHUB_TOKEN }}`. | Yes      | N/A     |
| `inactive_days`| Number of days since the last commit before a branch is considered inactive.     | No       | `30`    |
| `base_branch`  | The base branch used for the pull request.                                       | No       | `main`  |

## Sample Pull Request Body
```markdown
### Inactive Branch Notice

This branch has been inactive since YYYY-MM-DD. You are assigned as the reviewer. Please merge if complete, or close the PR and delete the branch.

@branch-creator
```

## Permissions
Ensure your GitHub Actions workflow has sufficient permissions to:
- **Read branches**
- **Create pull requests**
- **Assign reviewers**

Using `${{ secrets.GITHUB_TOKEN }}` should provide the necessary permissions for most standard uses.

## Installation and Build
**Repo Gardener** is a TypeScript project compiled using `@vercel/ncc` to produce a single-file distribution.

### Building the Project
Run the following command to build the `dist/index.js` file:
```bash
npm run build
```
Ensure you have the following dependencies installed:
- `@actions/core`
- `@actions/github`
- `@vercel/ncc`

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to open a pull request or issue in the repository.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.