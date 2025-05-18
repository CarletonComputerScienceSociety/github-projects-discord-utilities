export const UPDATE_PROJECT_V2_ITEM_DUE_DATE = `mutation UpdateDueDate(
  $projectId: ID!,
  $itemId: ID!,
  $fieldId: ID!,
  $date: Date!
) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId,
    itemId: $itemId,
    fieldId: $fieldId,
    value: {
      date: $date
    }
  }) {
    projectV2Item {
      id
    }
  }
}`;
