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
        const exitCode = await exec.exec(cmd, [], options);
        if (exitCode !== 0) {
            if (webhookUrl) sendWebhookEvent(webhookUrl, `Deployment failed for ${repositoryOwner}/${repositoryName} with exit code ${exitCode}`);
            throw new Error(`Command failed with exit code ${exitCode}: ${error}`);
        }

        // Extract URL from the output using regex
        const urlMatch = output.match(/(https:\/\/[\w.-]+\.\w+[\w/.-]*)/);
        if (urlMatch && urlMatch[0]) {
            const deployUrl = urlMatch[0];
            console.log(`Deployment URL: ${deployUrl}`);
            core.setOutput("url", deployUrl);
            if (webhookUrl) {
                sendWebhookEvent(webhookUrl, `Deployment successful for ${repositoryOwner}/${repositoryName}. View it at: <${deployUrl}>`);
            }
        } else {
            core.warning("Could not find deployment URL in output");
            core.setOutput("url", "");
            if (webhookUrl) sendWebhookEvent(webhookUrl, `Deployment successful for ${repositoryOwner}/${repositoryName}, but no URL was found in the output.`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();