import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
    try {
        const token = core.getInput('token');
        const dir = core.getInput('dir') || ".";
        const name = core.getInput('name');

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
        await exec.exec("npm i -g needle-cloud", [], options);
        const cmd = `needle-cloud deploy "${dir}" --name "${name}" --token "${token}"`;
        const exitCode = await exec.exec(cmd, [], options);
        if (exitCode !== 0) {
            throw new Error(`Command failed with exit code ${exitCode}: ${error}`);
        }

        // Extract URL from the output using regex
        const urlMatch = output.match(/(https:\/\/[\w.-]+\.\w+[\w/.-]*)/);
        if (urlMatch && urlMatch[0]) {
            const deployUrl = urlMatch[0];
            console.log(`Deployment URL: ${deployUrl}`);
            core.setOutput("url", deployUrl);
        } else {
            core.warning("Could not find deployment URL in output");
            core.setOutput("url", "");
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();