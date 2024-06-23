export const PROJECT_V2_ITEMS = `
{
  organization(login: "CarletonComputerScienceSociety"){
      projectV2(number: 18) {
			items(first: 100) {
			nodes {
				id
				content {
					... on DraftIssue {
						title
					}
					... on Issue {
						title
						url
					}
				}
				fieldValueByName(name: "Due") {
					... on ProjectV2ItemFieldDateValue {
						id
						date
					}
				}
				fieldValues(first: 10){
					nodes {
						... on ProjectV2ItemFieldDateValue {
						id
						date
						}
						... on ProjectV2ItemFieldUserValue {
							users(first: 5) {
								nodes {
									id
									url
								}
							}
						}
						... on ProjectV2ItemFieldLabelValue {
							labels(first: 5) {
								totalCount
								nodes {
									name
								}
							}
						}
			... on ProjectV2ItemFieldSingleSelectValue {
							id
							name
						}
					}
				}
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
  }
}
`;
