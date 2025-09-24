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

# Push to GitHub
Write-Host "🌐 Pushing to GitHub..."
git push git@github.com:USERNAME/REPO.git $branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub push successful."
} else {
    Write-Host "❌ GitHub push failed! Check SSH key or repo access."
}

# Push to GitLab
Write-Host "🌐 Pushing to GitLab..."
git push git@gitlab.com:USERNAME/REPO.git $branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitLab push successful."
} else {
    Write-Host "❌ GitLab push failed! Check SSH key or repo access."
}

Write-Host "🎉 Sync complete!"
