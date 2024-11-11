import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    // Get token
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error(`GITHUB_TOKEN environment variable is not set`);
    }

    // Get input values
    const inactiveDays = parseInt(core.getInput('inactive_days') || '30');
    const baseBranch = core.getInput('base_branch') || 'main';

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // Get the current date and calculate the threshold date
    const currentDate = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(currentDate.getDate() - inactiveDays);

    // List branches in the repository
    const { data: branches } = await octokit.rest.repos.listBranches({
      owner,
      repo,
    });

    for (const branch of branches) {
      // Skip protected branches
      if (branch.protected) {
        core.info(`Skipping protected branch: ${branch.name}`);
        continue;
      }

      // Check if a PR already exists for the branch
      const { data: prs } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${branch.name}`,
        state: 'open',
      });

      if (prs.length > 0) {
        core.info(`Skipping branch ${branch.name} as it already has an open PR.`);
        continue;
      }

      // Get the last commit of the branch
      const { data } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: branch.commit.sha,
      });

      const lastCommitDate = data.commit.author?.date ? new Date(data.commit.author.date) : null;

      // if lastCommitDate is null
      if (!lastCommitDate) {
        throw new Error(`Branch ${branch.name} is missing the last commit date.`);
      }

      if (lastCommitDate < thresholdDate) {
        // Branch is inactive
        const branchName = branch.name;
        const creator = data.author?.login || 'unknown';

        // Create a pull request for the branch
        const prTitle = `Review: Merge inactive branch '${branchName}'`;
        const prBody = `
### Inactive Branch Notice

This branch has been inactive since ${lastCommitDate.toISOString().split('T')[0]}.
You are assigned as the reviewer. Please merge if complete, or close the PR and delete the branch.

@${creator}
        `;

        await octokit.rest.pulls.create({
          owner,
          repo,
          title: prTitle,
          head: branchName,
          base: baseBranch,
          body: prBody,
        });

        core.info(`Pull request created for branch: ${branchName}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return core.setFailed(`Action failed with error: ${error.message}`);
    }

    core.setFailed('Action failed with an unknown error');
  }
}

run();