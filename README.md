# Deploy to Needle Cloud

Automatically deploy your spatial website to [Needle Cloud](https://cloud.needle.tools) with Github Actions

## Usage

1) [Create an access token](https://cloud.needle.tools/team) on Needle Cloud with `read/write` permissions
2) Add your access token in a repository secret and name it `NEEDLE_CLOUD_TOKEN`
3) Create a github workflow, e.g. `.github/workflows/deploy.yml`

*INFO*: For usage with Needle Engine make sure to install `4.4.0-beta.2` *or newer*

## Options

|Input||
|-|-|
| `token`| **required**, Needle Cloud access token
| `name` | deployment name, if no name is provided then the repository name will be used
| `dir` | root directory of the website files, must contain an `index.html`. If no directory is provided the build directory from `needle.config.json` will be used
| **Output** | |
| `url` | URL to the deployed website |

### Example
```yml
      - name: Deploy to Needle Cloud
        uses: needle-tools/deploy-to-needle-cloud-action@v1
        id: deploy
        with:
            token: ${{ secrets.NEEDLE_CLOUD_TOKEN }}
            name: vite-template
            dir: ./dist
```

## Full Example

Build and deploy vite based project to Needle Cloud. See the full project [here](https://github.com/needle-engine/vite-template).

```yml
name: Build and Deploy to Needle Cloud

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # Build the web project
      - name: Build web project
        run: npm run build:production
        env:
          NEEDLE_CLOUD_TOKEN: ${{ secrets.NEEDLE_CLOUD_TOKEN }}

      # Deploy to Needle Cloud
      - name: Deploy to Needle Cloud
        uses: needle-tools/deploy-to-needle-cloud-action@v1
        id: deploy
        with:
            token: ${{ secrets.NEEDLE_CLOUD_TOKEN }}
            dir: ./dist
            # name: vite-template # (optional, using the repository name if not provided)
        env:
          NODE_ENV: production
          NEEDLE_CLOUD_TOKEN: ${{ secrets.NEEDLE_CLOUD_TOKEN }}

      # Display the deployment URL
      - name: Display deployment URL
        run: |
          echo "::notice title=Deployment URL::Deployed to ${{ steps.deploy.outputs.url }}"

          # Add to GitHub step summary (appears at bottom of workflow run)
          echo "## 🚀 Deployment Summary" >> $GITHUB_STEP_SUMMARY
          echo "Application has been successfully deployed to Needle Cloud!" >> $GITHUB_STEP_SUMMARY
          echo "**Deployment URL:** [${{ steps.deploy.outputs.url }}](${{ steps.deploy.outputs.url }})" >> $GITHUB_STEP_SUMMARY
```

# Contact ✒️
<b>[🌵 Needle](https://needle.tools)</b> • 
[Github](https://github.com/needle-tools) • 
[Twitter](https://twitter.com/NeedleTools) • 
[Discord](https://discord.needle.tools) • 
[Forum](https://forum.needle.tools) • 
[Youtube](https://www.youtube.com/@needle-tools)

