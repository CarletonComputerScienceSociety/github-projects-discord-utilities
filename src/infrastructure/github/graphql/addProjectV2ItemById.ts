export const ADD_ISSUE_TO_PROJECT = `
mutation(
  $projectId: ID!,
  $contentId: ID!
) {
  addProjectV2ItemById(input: {
    projectId: $projectId,
    contentId: $contentId
  }) {
    item {
      id
    }
  }
}
`;
