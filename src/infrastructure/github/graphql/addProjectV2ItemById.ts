export const ADD_PROJECT_V2_ITEM_BY_ID = `
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
