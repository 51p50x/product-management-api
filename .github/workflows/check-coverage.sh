#!/bin/bash

# Check if coverage-summary.json exists
if [ ! -f "coverage/coverage-summary.json" ]; then
  echo "Error: coverage-summary.json not found"
  exit 1
fi

# Extract coverage percentage
COVERAGE=$(node -pe "JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json')).total.statements.pct")

echo "Test coverage: $COVERAGE%"

# Check if coverage meets minimum requirement (30%)
if (( $(echo "$COVERAGE < 30" | bc -l) )); then
  echo "❌ Test coverage is below 30% (current: $COVERAGE%)"
  exit 1
else
  echo "✅ Test coverage meets requirement (current: $COVERAGE% >= 30%)"
  exit 0
fi
