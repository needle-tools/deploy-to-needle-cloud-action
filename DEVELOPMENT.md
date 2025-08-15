# Development

- To modify or update the api don't forget to update `action.yml`


## Publish a new version
- push changes
- create a new tag (e.g. `v1.1.0`)
- [create a new release](https://github.com/needle-tools/deploy-to-needle-cloud-action/releases/new)
- wait for the pipeline to run and locally you may need to run `git fetch --tags --force`