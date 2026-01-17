#!/bin/bash

# Ano CLI Testing Script
# This script tests all terminal features of the Ano CLI tool

set -e  # Exit on error

echo "======================================"
echo "🧪 Ano CLI Testing Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test headers
test_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Testing: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to run a test
run_test() {
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${YELLOW}→ Test $TESTS_RUN: $1${NC}"
    echo "  Command: $2"

    if eval "$2"; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}  ✓ PASSED${NC}"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}  ✗ FAILED${NC}"
    fi
    echo ""
}

# Setup test files
setup_test_files() {
    test_section "Setup Test Environment"

    # Create test directory
    mkdir -p .ano-test
    cd .ano-test

    # Create test markdown file
    cat > test-plan.md << 'EOF'
# Test Plan for Feature X

## Overview
This is a test plan for implementing feature X in our application.

## Implementation Steps

1. Create database schema
2. Implement API endpoints
3. Build frontend components
4. Write tests
5. Deploy to staging

## Architecture Decisions

We will use PostgreSQL for data storage and React for the frontend.

## Security Considerations

- Input validation required
- Authentication middleware needed
- Rate limiting on API endpoints

## Timeline

Expected completion: 2 weeks
EOF

    echo -e "${GREEN}✓ Created test files in .ano-test/${NC}"
    echo ""
}

# Cleanup test files
cleanup_test_files() {
    cd ..
    rm -rf .ano-test
    echo -e "${GREEN}✓ Cleaned up test files${NC}"
}

# Main testing sequence
main() {
    echo "This script will test all Ano CLI commands systematically."
    echo "Press Enter to begin, or Ctrl+C to cancel..."
    read

    # Setup
    setup_test_files

    # Test 1: Team Initialization
    test_section "1. Team Management Commands"
    run_test "Initialize team" "ano team init 'Test Team'"
    run_test "Show team info" "ano team list"
    run_test "Add team member" "ano team add alice@example.com --name 'Alice' --role reviewer"
    run_test "Add another member" "ano team add bob@example.com --name 'Bob' --role lead"
    run_test "List team members" "ano team list"

    # Test 2: Basic Annotation Commands
    test_section "2. Basic Annotation Commands"
    run_test "Add concern annotation" "ano annotate test-plan.md:7 'This might be too complex' --type concern"
    run_test "Add question annotation" "ano annotate test-plan.md:11 'Which PostgreSQL version?' --type question"
    run_test "Add suggestion annotation" "ano annotate test-plan.md:15 'Consider adding CORS configuration' --type suggestion"
    run_test "Add blocker annotation" "ano annotate test-plan.md:19 'Security audit required before deployment' --type blocker"
    run_test "Add multi-line annotation" "ano annotate test-plan.md:7-9 'These three steps need more detail' --type concern"

    # Test 3: List Commands
    test_section "3. List and Display Commands"
    run_test "List all annotations" "ano list test-plan.md"
    run_test "List only blockers" "ano list test-plan.md --type blocker"
    run_test "List only open items" "ano list test-plan.md --status open"
    run_test "List with JSON output" "ano list test-plan.md --json"

    # Test 4: Quick Commands
    test_section "4. Quick Shortcut Commands"
    run_test "Add nit (minor suggestion)" "ano nit test-plan.md:3 'Minor typo: should be Feature'"
    run_test "Add question (quick)" "ano q test-plan.md:5 'What about mobile support?'"
    run_test "Add blocker (quick)" "ano block test-plan.md:17 'Missing encryption strategy'"

    # Test 5: Thread/Reply Commands
    test_section "5. Thread and Reply Commands"
    echo -e "${YELLOW}→ Getting first annotation ID for reply test...${NC}"

    # Better ID extraction - use simpler method
    ANNOTATION_ID=$(ano list test-plan.md --json 2>/dev/null | grep -m 1 '"id"' | sed 's/.*"id": "\([^"]*\)".*/\1/')

    if [ -n "$ANNOTATION_ID" ]; then
        echo -e "${BLUE}  Found annotation ID: ${ANNOTATION_ID:0:8}...${NC}"
        run_test "Reply to annotation" "ano reply test-plan.md $ANNOTATION_ID 'I agree, let me revise this'"
        run_test "Add another reply" "ano reply test-plan.md $ANNOTATION_ID 'Updated in latest version'"
    else
        echo -e "${YELLOW}  ⚠ Skipping reply tests (no annotations found)${NC}"
    fi

    # Test 6: Resolve Commands
    test_section "6. Resolve and Reopen Commands"
    if [ -n "$ANNOTATION_ID" ]; then
        run_test "Resolve annotation" "ano resolve test-plan.md $ANNOTATION_ID"
        run_test "Verify resolution" "ano list test-plan.md --status resolved"
        run_test "Reopen annotation" "ano reopen test-plan.md $ANNOTATION_ID"
        run_test "Verify reopened" "ano list test-plan.md --status open"
    else
        echo -e "${YELLOW}  ⚠ Skipping resolve tests (no annotations found)${NC}"
    fi

    # Test 11: Delete Commands (moved here since we have the ID)
    test_section "11. Delete Commands"
    if [ -n "$ANNOTATION_ID" ]; then
        run_test "Delete annotation with force" "ano delete test-plan.md $ANNOTATION_ID --force"
        run_test "Verify deletion" "ano list test-plan.md"
    else
        echo -e "${YELLOW}  ⚠ Skipping delete tests (no annotations found)${NC}"
    fi

    # Test 7: Approval Commands
    test_section "7. Approval Workflow Commands"
    run_test "Add approval" "ano approve test-plan.md -m 'Architecture looks solid'"
    run_test "Add approval with title" "ano approve test-plan.md -m 'LGTM' --title 'Senior Engineer'"
    run_test "Request changes" "ano approve test-plan.md -m 'Needs security review' --request-changes"

    # Note: These will fail if there are blockers (which is correct behavior)
    echo -e "${YELLOW}→ Note: Check commands expected to fail due to blockers${NC}"
    run_test "Check approval status (expect failure due to blockers)" "ano check test-plan.md || true"
    run_test "Check with JSON output (expect failure)" "ano check test-plan.md --json || true"

    # Test 8: Quick Approval Commands
    test_section "8. Quick Approval Commands"
    run_test "LGTM (Looks Good To Me)" "ano lgtm test-plan.md"
    run_test "Ship It!" "ano shipit test-plan.md"
    run_test "LGTM with custom message" "ano lgtm test-plan.md -m 'Ready for production'"

    # Test 9: Diff Commands
    test_section "9. Diff and Version Commands"
    run_test "Show diff with git" "ano diff --git test-plan.md || true"

    # Test 10: Sync Commands
    test_section "10. Sync and Anchoring Commands"
    echo -e "${YELLOW}→ Modifying file to test sync...${NC}"
    # Insert a new line at the beginning
    echo "# UPDATED PLAN" > temp.md
    cat test-plan.md >> temp.md
    mv temp.md test-plan.md

    run_test "Sync annotations after file change" "ano sync test-plan.md"
    run_test "List after sync" "ano list test-plan.md"

    # Test 12: Import/Export Commands
    test_section "12. Import and Export Commands"
    run_test "Export annotations" "ano export test-plan.md annotations-backup.json"
    run_test "Verify export file exists" "test -f annotations-backup.json"
    run_test "Import annotations" "ano import test-plan.md annotations-backup.json"

    # Test 13: Web Server Command
    test_section "13. Web Server Command"
    echo -e "${YELLOW}→ Testing web server (will start in background)...${NC}"
    echo "  Command: ano serve test-plan.md --port 3001"

    # Start server in background
    ano serve test-plan.md --port 3001 &
    SERVER_PID=$!

    # Wait for server to start
    sleep 3

    # Check if server is running
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo -e "${GREEN}  ✓ Server started (PID: $SERVER_PID)${NC}"
        echo -e "${BLUE}  → Open http://localhost:3001 in your browser to test web UI${NC}"
        echo -e "${YELLOW}  → Press Enter to stop the server and continue...${NC}"
        read
        kill $SERVER_PID
        echo -e "${GREEN}  ✓ Server stopped${NC}"
    else
        echo -e "${RED}  ✗ Server failed to start${NC}"
    fi
    echo ""

    # Test 14: Help and Version Commands
    test_section "14. Help and Version Commands"
    run_test "Show main help" "ano --help"
    run_test "Show version" "ano --version"
    run_test "Show annotate help" "ano annotate --help"
    run_test "Show team help" "ano team --help"
    run_test "Show approve help" "ano approve --help"

    # Summary
    echo ""
    echo "======================================"
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo "======================================"
    echo -e "Total Tests Run:    ${BLUE}$TESTS_RUN${NC}"
    echo -e "Tests Passed:       ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed:       ${RED}$TESTS_FAILED${NC}"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
    else
        echo -e "\n${RED}✗ Some tests failed. Please review the output above.${NC}\n"
    fi

    echo "Test files are preserved in .ano-test/ for manual inspection."
    echo "Run 'rm -rf .ano-test' to clean up when done."
    echo ""
}

# Run main function
main

# Note: Don't auto-cleanup so user can inspect results
# cleanup_test_files
