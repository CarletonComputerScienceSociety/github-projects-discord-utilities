# Github Project Reminders

The following project is a cron job that formats GitHub project data into Discord messages.

## Setup

To set up the project, follow these steps:

1. Clone the repository:

```
git clone https://github.com/your-username/github-project-reminders.git
```

2. Navigate to the project directory:

```
cd github-project-reminders
```

3. Install the required dependencies:

```
npm install
```

4. Install dotenv-cli

```
npm install -g dotenv-cli
```

5. Create a "test" Discord channel webhook

- Create a private Discord text channel and click settings
- Create a webhook on the integrations screen and copy the webhook url

![instructions](https://i.imgur.com/Qm9ZcsM.png)
![instructions2](https://i.imgur.com/ki3cjHN.png)

6. Create a `.env` file with the webhook url

```
DISCORD_CHANNEL_WEBHOOK_URL=YOUR_WEBHOOK_URL_HERE
GITHUB_ACCESS_TOKEN=(ask Matthew for this)
DISCORD_ALERTS_WEBHOOK_URL=YOUR_ALERTS_CHANNEL_WEBHOOK_URL_HERE
```

7. Start the job:

```
npm run prod <jobname>
```

## Jobs

| Job Name            | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `dailyTaskReminder` | Sends the reminder for upcoming tasks on a daily basis                |
| `promotionReminder` | Sends the reminder for promotional materials due in the next 24 hours |

## Notes

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

Project Query

```graphql
{
  organization(login: "CarletonComputerScienceSociety") {
    projectV2(number: 19) {
      id
    }
  }
}
```

Project Items Query

```graphql
{
  organization(login: "CarletonComputerScienceSociety") {
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
          fieldValues(first: 10) {
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
```
