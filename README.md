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
| `webhookUrl` | optional webhook URL for deployment notifications (e.g., Discord, Slack)
| `no-unfurl` | set to `'true'` to prevent URL unfurling in webhook messages

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
            webhookUrl: ${{ secrets.DISCORD_WEBHOOK_URL }} # optional
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
            webhookUrl: ${{ secrets.DISCORD_WEBHOOK_URL }} # optional: send notifications to Discord/Slack
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

## Webhook Notifications

The action supports sending deployment notifications to Discord, Slack, or any service that accepts webhooks. Notifications include:

- 🎉 **Successful deployments** with repository link, commit info, job link, commit message, and deployment URL
- 🧨 **Failed deployments** with error details and commit information  
- 📯 **Deployments without URL** when deployment succeeds but no URL is found

### Webhook Message Format

Messages include:
- **Repository link** - Link to the GitHub repository
- **Commit link** - `[abc1234](url)` format linking to the specific commit
- **Job link** - Link to the GitHub Actions run
- **Commit message** - First 200 characters in a code block
- **Deployment URL** - The deployed site URL (for successful deployments)

### Setup for Discord

1. Create a webhook in your Discord server (Server Settings → Integrations → Webhooks)
2. Copy the webhook URL
3. Add it as a repository secret named `DISCORD_WEBHOOK_URL`
4. Add `webhookUrl: ${{ secrets.DISCORD_WEBHOOK_URL }}` to your workflow

### Setup for Slack

1. Create a Slack app with incoming webhooks enabled
2. Copy the webhook URL  
3. Add it as a repository secret named `SLACK_WEBHOOK_URL`
4. Add `webhookUrl: ${{ secrets.SLACK_WEBHOOK_URL }}` to your workflow
```

# Contact ✒️
<b>[🌵 Needle](https://needle.tools)</b> • 
[Github](https://github.com/needle-tools) • 
[Twitter](https://twitter.com/NeedleTools) • 
[Discord](https://discord.needle.tools) • 
[Forum](https://forum.needle.tools) • 
[Youtube](https://www.youtube.com/@needle-tools)

