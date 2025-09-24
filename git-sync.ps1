# ==============================
# GitHub + GitLab Sync Script
# ==============================

param(
    [string]$Message = "chore: sync update"
)

$branch = git rev-parse --abbrev-ref HEAD

# Ensure clean working tree
$changes = git status --porcelain
if ($changes) {
    Write-Host "⚠️  You have uncommitted changes. Commit or stash first."
    exit 1
}

Write-Host "📦 Committing changes..."
git add .
git commit -m "$Message" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️  Nothing to commit."
}

Write-Host "🚀 Pushing to GitHub + GitLab..."
git push origin $branch

Write-Host "✅ Sync complete!"
