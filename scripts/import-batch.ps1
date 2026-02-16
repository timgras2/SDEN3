param(
  [Parameter(Mandatory = $true)]
  [string]$BatchFile,

  [string]$DatabaseFile = "sden3_flashcards_database.json",

  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $BatchFile)) {
  throw "Batch file not found: $BatchFile"
}

if (-not (Test-Path -LiteralPath $DatabaseFile)) {
  throw "Database file not found: $DatabaseFile"
}

$db = Get-Content -LiteralPath $DatabaseFile -Raw | ConvertFrom-Json
$batch = Get-Content -LiteralPath $BatchFile -Raw | ConvertFrom-Json

$hasImportBatch = $batch.PSObject.Properties.Name -contains "import_batch"
$hasFlashcards = $batch.PSObject.Properties.Name -contains "flashcards"

$newCards = if ($hasImportBatch -and $null -ne $batch.import_batch -and ($batch.import_batch.PSObject.Properties.Name -contains "flashcards")) {
  @($batch.import_batch.flashcards)
} elseif ($hasFlashcards) {
  @($batch.flashcards)
} else {
  throw "No flashcards array found in $BatchFile"
}

if ($newCards.Count -eq 0) {
  throw "No cards found in batch file: $BatchFile"
}

$requiredFields = @("id", "category", "difficulty", "source", "question", "answer", "explanation", "tags")
$allowedDifficulties = @("easy", "medium", "hard")
$existingCategories = @($db.categories | ForEach-Object { $_.id })

$missingFieldsErrors = @()
$invalidDifficultyErrors = @()
$invalidCategoryErrors = @()
$invalidTagsErrors = @()

foreach ($card in $newCards) {
  foreach ($field in $requiredFields) {
    if (-not ($card.PSObject.Properties.Name -contains $field) -or [string]::IsNullOrWhiteSpace([string]$card.$field)) {
      $missingFieldsErrors += "Card '$($card.id)' missing required field '$field'"
    }
  }

  if ($card.PSObject.Properties.Name -contains "difficulty" -and $allowedDifficulties -notcontains [string]$card.difficulty) {
    $invalidDifficultyErrors += "Card '$($card.id)' has invalid difficulty '$($card.difficulty)'"
  }

  if ($card.PSObject.Properties.Name -contains "category" -and $existingCategories -notcontains [string]$card.category) {
    $invalidCategoryErrors += "Card '$($card.id)' has unknown category '$($card.category)'"
  }

  if ($card.PSObject.Properties.Name -contains "tags" -and $null -eq $card.tags) {
    $invalidTagsErrors += "Card '$($card.id)' has null tags; expected array"
  }
}

$batchIds = @($newCards | ForEach-Object { $_.id })
$dupesInBatch = @($batchIds | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
$existingIds = @($db.flashcards | ForEach-Object { $_.id })
$dupesInDb = @($batchIds | Where-Object { $existingIds -contains $_ } | Select-Object -Unique)

$allValidationErrors = @()
$allValidationErrors += $missingFieldsErrors
$allValidationErrors += $invalidDifficultyErrors
$allValidationErrors += $invalidCategoryErrors
$allValidationErrors += $invalidTagsErrors

if ($dupesInBatch.Count -gt 0) {
  $allValidationErrors += "Duplicate IDs inside batch: $($dupesInBatch -join ', ')"
}
if ($dupesInDb.Count -gt 0) {
  $allValidationErrors += "IDs already exist in database: $($dupesInDb -join ', ')"
}

if ($allValidationErrors.Count -gt 0) {
  $allValidationErrors | ForEach-Object { Write-Error $_ }
  throw "Import aborted due to validation errors."
}

$beforeCount = @($db.flashcards).Count
$afterCount = $beforeCount + $newCards.Count

if ($DryRun) {
  Write-Host "Dry run OK"
  Write-Host "Database file : $DatabaseFile"
  Write-Host "Batch file    : $BatchFile"
  Write-Host "Cards to add  : $($newCards.Count)"
  Write-Host "Total after   : $afterCount"
  exit 0
}

$db.flashcards = @($db.flashcards) + $newCards

if ($null -eq $db.metadata) {
  $db | Add-Member -MemberType NoteProperty -Name metadata -Value (@{})
}

$db.metadata.total_cards = @($db.flashcards).Count
$db.metadata.last_updated = (Get-Date).ToString("yyyy-MM-dd")
$db.metadata.sources = @(
  $db.flashcards |
    ForEach-Object { $_.source } |
    Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } |
    Select-Object -Unique
)

$db | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $DatabaseFile -Encoding UTF8

Write-Host "Import completed"
Write-Host "Database file : $DatabaseFile"
Write-Host "Batch file    : $BatchFile"
Write-Host "Cards added   : $($newCards.Count)"
Write-Host "Total cards   : $($db.metadata.total_cards)"
