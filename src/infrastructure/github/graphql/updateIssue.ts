export const UPDATE_ISSUE_ASSIGNEE = `mutation UpdateIssueAssignee(
  $issueId: ID!
  $assigneeIds: [ID!]!
) {
  updateIssue(input: {
    id: $issueId
    assigneeIds: $assigneeIds
  }) {
    issue {
      id
    }
  }
}
`;
