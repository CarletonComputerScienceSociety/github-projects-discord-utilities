export const CREATE_ISSUE_WITH_PROJECT = `
mutation(
  $repositoryId: ID!,
  $title: String!,
  $body: String,
) {
  createIssue(input: {
    repositoryId: $repositoryId,
    title: $title,
    body: $body,
  }) {
    issue {
      id
      number
      title
      url
      createdAt
      updatedAt
    }
  }
}
`;
