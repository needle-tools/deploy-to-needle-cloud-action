const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

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