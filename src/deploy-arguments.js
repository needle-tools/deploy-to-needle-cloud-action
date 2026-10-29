/** Build arguments without shell interpolation; validation belongs to the CLI.
 * @param {{dir: string, name: string, token: string, label?: string}} inputs
 * @returns {string[]} */
export function deployArguments({dir, name, token, label}) {
    const args = ['deploy', dir, '--name', name, '--token', token];
    if (label) args.push('--label', label);
    return args;
}
