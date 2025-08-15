import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { sendWebhookEvent } from './webhook';

async function run() {
    try {
        const [repositoryOwner, repositoryName] = process.env.GITHUB_REPOSITORY.split("/");
        const token = core.getInput('token');
        const dir = core.getInput('dir') || ".";
        const name = core.getInput('name') || repositoryName;
        const next = core.getInput('next') === 'true';
        const webhookUrl = core.getInput('webhookUrl');
        const noUnfurl = core.getInput('no-unfurl') === 'true';

        const repositoryHtmlUrl = `${process.env.GITHUB_SERVER_URL}/${repositoryOwner}/${repositoryName}`;
        const actionJobUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

        if (!webhookUrl) {
            core.warning("No webhook URL provided.");
        }

        let output = '';
        let error = '';
        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    error += data.toString();
                }
            }
        };
        if (next) {
            await exec.exec("npm i -g needle-cloud@next", [], options);
        }
        else {
            await exec.exec("npm i -g needle-cloud", [], options);
        }
        const cmd = `needle-cloud deploy "${dir}" --name "${name}" --token "${token}"`;
        const exitCode = await exec.exec(cmd, [], options).catch((err) => {
            error += err.message;
            return { exitCode: 1, error: err.message };
        });
        if (exitCode !== 0) {
            if (webhookUrl) {
                sendWebhookEvent(webhookUrl, `**Deployment failed** ([Github Job](<${actionJobUrl}>)) with exit code ${exitCode}`);
            }
            throw new Error(`Command failed with exit code ${exitCode}: ${error}`);
        }

        // Extract URL from the output using regex
        const urlMatch = output.match(/(https:\/\/[\w.-]+\.\w+[\w/.-]*)/);
        if (urlMatch && urlMatch[0]) {
            const deployUrl = urlMatch[0];
            console.log(`Deployment URL: ${deployUrl}`);
            core.setOutput("url", deployUrl);
            if (webhookUrl) {
                const url_str = noUnfurl ? `<${deployUrl}>` : `${deployUrl}`;
                sendWebhookEvent(webhookUrl, `🎉 **${repositoryOwner}/${repositoryName} deployed successfully** — [Repository](<${repositoryHtmlUrl}>) — [Github Job](<${actionJobUrl}>)\n\n${url_str}`);
            }
        } else {
            core.warning("Could not find deployment URL in output");
            core.setOutput("url", "");
            if (webhookUrl) sendWebhookEvent(webhookUrl, `**Deployed ${repositoryOwner}/${repositoryName}** — [Repository](<${repositoryHtmlUrl}>) — [Github Job](<${actionJobUrl}>) but no URL was found in the output.`);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();