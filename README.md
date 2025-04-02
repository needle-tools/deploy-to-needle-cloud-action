# Deploy to Needle Cloud

## Usage

1) Create an access token on Needle Cloud with write permissions
2) Add your access token as a repository secret and name it e.g. `NEEDLE_CLOUD_TOKEN`
3) Create a github workflow as e.g. `.github/workflows/deploy.yml` ([full example](https://github.com/needle-engine/vite-template/blob/main/.github/workflows/deploy.yml))

## Options

|||
|-|-|
| `token`| required, Needle Cloud access token
| `name` | deployment name
| `dir` | root directory of the website files, must contain an `index.html`

## Example
```yml
      - name: Deploy to Needle Cloud
        uses: needle-tools/deploy-to-needle-cloud-action@v1.0.1
        id: deploy
        with:
            token: ${{ secrets.NEEDLE_CLOUD_TOKEN }}
            name: vite-template
            dir: ./dist
```