param(
    [string]$Message = "Auto-sync commit"
)

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD

Write-Host "📦 Committing changes..."
$changes = git status --porcelain
if ($changes) {
    git add .
    git commit -m "$Message"
} else {
    Write-Host "ℹ️  Nothing to commit."
}

Write-Host "🌐 Pushing to GitHub..."
git push github $branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub push successful!"
} else {
    Write-Host "❌ GitHub push failed! Check SSH key or token setup."
}

Write-Host "🌐 Pushing to GitLab..."
git push gitlab $branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitLab push successful!"
} else {
    Write-Host "❌ GitLab push failed! Check SSH key or token setup."
}

Write-Host "🎉 Sync complete!"
