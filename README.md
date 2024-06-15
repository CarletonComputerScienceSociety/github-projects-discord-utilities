### Github Project Reminders

Project Number Query:

```graphql
{
  organization(login: "CarletonComputerScienceSociety") {
    id
    projectsV2(first: 10) {
      nodes {
        id
        title
        number
      }
    }
  }
}
```

```graphql
{
  organization(login: "CarletonComputerScienceSociety") {
    projectV2(number: 19) {
      id
    }
  }
}
```
