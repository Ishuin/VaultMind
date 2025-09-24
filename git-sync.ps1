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
if (git push github $branch) {
    Write-Host "✅ GitHub push successful!"
} else {
    Write-Host "❌ GitHub push failed! Check SSH key or token setup."
}

Write-Host "🌐 Pushing to GitLab..."
if (git push gitlab $branch) {
    Write-Host "✅ GitLab push successful!"
} else {
    Write-Host "❌ GitLab push failed! Check SSH key or token setup."
}

Write-Host "🎉 Sync complete!"
