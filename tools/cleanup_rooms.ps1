$ErrorActionPreference = 'Stop'

param(
  [string]$Project = 'seed-services'
)

Write-Host "Deleting Firestore collection: big2Rooms (project: $Project)" -ForegroundColor Yellow
Write-Host "This will only delete room docs. It will NOT touch leaderboard or game logs." -ForegroundColor Yellow

& firebase firestore:delete big2Rooms --project $Project --force
