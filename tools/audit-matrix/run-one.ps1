# run-one.ps1 — 외부 레인(codex·agy) 발견자 1건 실행기 (15_AUDIT_MATRIX §4)
#   래퍼 절차 내장: 고유 임시 출력명 → exit code → validate.mjs 재검증 → 최종 이름 이동, 실패 시 1회 재시도 → MISSING 기록
#   Claude 레인(opus/sonnet)은 이 스크립트 밖 — 본선이 Agent 도구로 발사.
# 사용:
#   powershell -File tools\audit-matrix\run-one.ps1 -Agent AG01 -Lane codex -Chapter CH01 [-Campaign 이름] [-DryRun]
#   AG07: -Chapter CURRICULUM · AG08: -Chapter AG08-CH01-17 형태(조립 폴더명)
# 섹션: param | 경로 상수 | 레인 프롬프트 생성 | Invoke-Lane | 래퍼(시도→검증→이동) | main
param(
  [Parameter(Mandatory)][ValidateSet('AG01','AG02','AG03','AG04','AG05','AG06','AG07','AG08','AG09')][string]$Agent,
  [Parameter(Mandatory)][ValidateSet('codex','agy')][string]$Lane,
  [Parameter(Mandatory)][string]$Chapter,
  [string]$Campaign = '2026-08-03-matrix-audit',
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$Repo = 'C:\SAP\sap-dev-academy'
$Camp = Join-Path $Repo ".archive\$Campaign"
$PromptFile = Join-Path $Camp "_prompts\$Chapter\$Agent.md"
if (-not (Test-Path $PromptFile)) { throw "조립 프롬프트 없음: $PromptFile (assemble.mjs 먼저)" }
$Schema = Join-Path $Repo 'tools\audit-matrix\schema.json'
$RawDir = Join-Path $Camp "raw\$Chapter"
$TraceDir = Join-Path $Camp "_trace\$Chapter"
$Ws = Join-Path $env:LOCALAPPDATA "Temp\audit-matrix-ws\$Campaign"
New-Item -ItemType Directory -Force $RawDir, $TraceDir, $Ws, (Join-Path $Ws 'codex-ws') | Out-Null

if ($Lane -eq 'codex') { $Model = 'gpt-5.6-sol'; $Serve = 'http://localhost:8141' }
else { $Model = 'gemini-3.7-flash-high'; $Serve = 'http://localhost:8142' }   # 3.6→3.7 전환(사용자 지시 2026-08-21)

# 레인 프롬프트(MODEL_ID·SERVE_URL 치환) — BOM 없는 UTF-8로 기록
$LanePrompt = Join-Path $Ws "$Chapter-$Agent-$Lane.prompt.md"
$text = [IO.File]::ReadAllText($PromptFile, [Text.UTF8Encoding]::new($false))
$text = $text.Replace('{{MODEL_ID}}', $Model).Replace('{{SERVE_URL}}', $Serve)
# agy 레인 전용 엄격화 보정(관대 편향 교정, 사용자 지시 2026-08-21) — 라이더 원문 = agy-strict-rider.md
$Rider = Join-Path $PSScriptRoot 'agy-strict-rider.md'
if ($Lane -eq 'agy' -and (Test-Path $Rider)) {
  $text += "`n`n" + [IO.File]::ReadAllText($Rider, [Text.UTF8Encoding]::new($false))
}
[IO.File]::WriteAllText($LanePrompt, $text, [Text.UTF8Encoding]::new($false))

$Final = Join-Path $RawDir ("$Agent-$Model.json")
$Missing = Join-Path $RawDir ("$Agent-$Model.MISSING.txt")

function Invoke-Lane([string]$TmpOut, [int]$Try) {
  if ($Lane -eq 'codex') {
    $trace = Join-Path $TraceDir ("$Agent-codex.try$Try.trace.jsonl")
    $flags = @('exec', '-m', $Model, '--ephemeral', '--skip-git-repo-check',
      '-c', 'web_search="disabled"', '-c', 'approval_policy="never"',
      '--strict-config', '--color', 'never', '--json',
      '--output-schema', $Schema, '-o', $TmpOut)
    if ($Agent -eq 'AG02') {
      $flags += @('--sandbox', 'workspace-write', '-C', (Join-Path $Ws 'codex-ws'),
        '-c', 'sandbox_workspace_write.network_access=true')
    } else {
      $flags += @('--sandbox', 'read-only', '-C', $Repo)
    }
    $flags += '-'
    if ($DryRun) { Write-Host "[DryRun codex] type lanePrompt | codex $($flags -join ' ')"; return 0 }
    $prev = [Console]::OutputEncoding
    $OutputEncoding = [Text.UTF8Encoding]::new($false)   # PS→네이티브 파이프 인코딩 명시(코덱스 권고 반영)
    try { Get-Content $LanePrompt -Raw -Encoding UTF8 | & codex.cmd @flags > $trace }
    finally { $OutputEncoding = $prev }
    return $LASTEXITCODE
  }
  else {
    $pointer = "Read the UTF-8 text file at $LanePrompt and follow ALL instructions in it exactly. " +
      "The instructions are written in Korean. Do not attempt to repair or re-encode the text - read it directly as UTF-8."
    $flags = @('-p', $pointer, '--model', $Model,
      '--output-format', 'json', '--json-schema', $Schema, '--print-timeout', '15m')
    if ($Agent -ne 'AG02') { $flags += '--sandbox' }   # AG02만 무샌드박스(브라우저 명령), 그 외 샌드박스 유지
    if ($DryRun) { Write-Host "[DryRun agy] agy $($flags -join ' ')  (cwd=$Ws)"; return 0 }
    Push-Location $Ws
    $prevOut = [Console]::OutputEncoding
    try {
      # agy는 UTF-8로 stdout을 낸다 — PS 기본 콘솔 디코딩(CP949)·`>` 리다이렉트(UTF-16)를 피해 원문 보존
      [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
      $out = & "$env:LOCALAPPDATA\agy\bin\agy.exe" @flags
      [IO.File]::WriteAllText($TmpOut, ($out | Out-String), [Text.UTF8Encoding]::new($false))
    } finally { [Console]::OutputEncoding = $prevOut; Pop-Location }
    return $LASTEXITCODE
  }
}

if ($DryRun) { Invoke-Lane -TmpOut '(dry)' -Try 1 | Out-Null; return }

$reasons = @()
foreach ($try in 1, 2) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $tmp = Join-Path $Ws "$Chapter-$Agent-$Lane.$stamp.try$try.json"
  $code = Invoke-Lane -TmpOut $tmp -Try $try
  if ($code -ne 0) { $reasons += "try${try}: exit $code"; continue }
  node (Join-Path $Repo 'tools\audit-matrix\validate.mjs') --single $tmp | Out-Host
  if ($LASTEXITCODE -eq 0) {
    Move-Item $tmp $Final -Force
    if (Test-Path $Missing) { Remove-Item $Missing -Force -Confirm:$false }
    Write-Host "OK → $Final"
    exit 0
  }
  $reasons += "try${try}: 스키마/앵커 검증 실패 (임시 보존: $tmp)"
}
Set-Content -Path $Missing -Value ("결측 사유: " + ($reasons -join ' / ')) -Encoding UTF8
Write-Host "MISSING → $Missing"
exit 1
