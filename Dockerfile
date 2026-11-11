# Keep this tag in sync with the @playwright/test version in package-lock.json and the
# container image in .github/workflows/playwright.yml (CI fails if they differ) —
# the image ships the browser builds that exact version expects.
FROM mcr.microsoft.com/playwright:v1.65.0-noble

ENV CI=true \
    RESULTS_DIR=/results \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app
RUN chown pwuser:pwuser /app && mkdir -p /results && chown pwuser:pwuser /results

USER pwuser

COPY --chown=pwuser:pwuser package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=pwuser:pwuser . .

# Arguments after the image name are passed straight to `playwright test`, e.g.
#   docker run --rm --ipc=host playwright-tests --project chromium --grep @smoke
# With no arguments the full suite runs across every configured browser.
ENTRYPOINT ["/app/node_modules/.bin/playwright", "test"]
