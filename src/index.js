import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { sendWebhookEvent } from './webhook';
import { existsSync, readFileSync } from 'fs';

async function run() {
    try {
        const [repositoryOwner, repositoryName] = process.env.GITHUB_REPOSITORY.split("/");
        const token = core.getInput('token');
        const dir = core.getInput('dir') || ".";
        const name = core.getInput('name') || repositoryName;
        const overrideVersion = core.getInput('overrideVersion');
        const webhookUrl = core.getInput('webhookUrl');
        const noUnfurl = core.getInput('no-unfurl') === 'true';

        const repositoryHtmlUrl = `${process.env.GITHUB_SERVER_URL}/${repositoryOwner}/${repositoryName}`;
        const actionJobUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
        const commitSha = process.env.GITHUB_SHA;
        const commitUrl = `${process.env.GITHUB_SERVER_URL}/${repositoryOwner}/${repositoryName}/commit/${commitSha}`;

        // Get commit message, escape backticks, and limit to 200 chars
        let commitMessage = '';
        try {
            let rawMessage = '';
            await exec.exec('git', ['log', '-1', '--pretty=%B', commitSha], {
                listeners: {
                    stdout: (data) => {
                        rawMessage += data.toString();
                    }
                }
            });
            commitMessage = rawMessage.trim().replace(/`/g, '\\`');
            if (commitMessage.length > 200) {
                commitMessage = commitMessage.substring(0, 197) + '...';
            }
        } catch (error) {
            commitMessage = 'Unable to retrieve commit message';
        }

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
        if (overrideVersion?.length) {
            console.warn(`Installing needle-cloud package: ${overrideVersion}`)
            await exec.exec("npm i -g needle-cloud@" + overrideVersion, [], options);
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
                sendWebhookEvent(webhookUrl, `🧨 **Deployment failed** — [${commitSha?.substring(0, 7)}](<${commitUrl}>) — [Github Job](<${actionJobUrl}>) with exit code ${exitCode}\n\`\`\`\n${commitMessage}\n\`\`\``);
            }
            throw new Error(`Command failed with exit code ${exitCode}: ${error}`);
        }

        // Extract URL from the output using regex
        const urlMatch = output.match(/(https:\/\/[\w.-]+\.\w+[\w/.-]*)/);
        if (urlMatch && urlMatch[0]) {

            const edit_id = readOutput("edit_id");
            let edit_url = null;
            if (edit_id) {
                edit_url = "https://cloud.needle.tools/edit/" + edit_id;
                console.log(`Edit URL: ${edit_url}`);
                core.setOutput("edit_url", edit_url);
            }

            const deployUrl = urlMatch[0];
            console.log(`Deployment URL: ${deployUrl}`, edit_url);
            core.setOutput("url", deployUrl);

            if (webhookUrl) {
                const url_str = noUnfurl ? `<${deployUrl}>` : `${deployUrl}`;
                sendWebhookEvent(webhookUrl, `🎉 **${repositoryOwner}/${repositoryName} deployed successfully** — [Repository](<${repositoryHtmlUrl}>) — [${commitSha?.substring(0, 7)}](<${commitUrl}>) — [Github Job](<${actionJobUrl}>)\n\`\`\`\n${commitMessage}\n\`\`\`\n${url_str}`);
            }
        } else {
            core.warning("Could not find deployment URL in output");
            core.setOutput("url", "");
            if (webhookUrl) sendWebhookEvent(webhookUrl, `📯 **Deployed ${repositoryOwner}/${repositoryName}** — [Repository](<${repositoryHtmlUrl}>) — [${commitSha?.substring(0, 7)}](<${commitUrl}>) — [Github Job](<${actionJobUrl}>) → but no URL was found in the output.\n\`\`\`\n${commitMessage}\n\`\`\``);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();


/**
 * Reads an output variable from the GitHub Actions environment file.
 * @param {string} key - The key of the output variable to read.
 * @returns {string | undefined} - The value of the output variable, or undefined if not found.
 */
function readOutput(key) {
    try {
        const path = process.env.GITHUB_OUTPUT;
        if (path && existsSync(path)) {
            const content = readFileSync(path, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const [k, v] = line.split('=');
                if (k === key) {
                    return v;
                }
            }
        }
    }
    catch (err) {
        console.error("Error reading GITHUB_OUTPUT:", err);
    }
    return undefined;
}