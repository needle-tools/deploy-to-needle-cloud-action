import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';

try {

    const token = core.getInput('token');
    const dir = core.getInput('dir') || ".";
    const name = core.getInput('name');
    
    const cmd = `npx --yes needle-cloud deploy "${dir}" --name "${name}" --token "${token}"`;
    const res = await exec.exec(cmd);
    core.setOutput("url", res);

}
catch (error) {
    core.setFailed(error.message);
}