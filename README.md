# Afrisal PR Tracker

This action log common PR Data to firebase

```txt
Afrisal : Not to be confused with @afrishal, Accommodation FRontend Integration System for ALl. (pun intended)
```

## Background

Based on our retro, we realize that code review become an activity that slow down the agility of the team. At the same time, removing code review might reduce the code quality and might introduce a new bug. Hence we want to measure the development speed so we can identify the problem and might improve the overall developer experience workflow.

# Solutions

There are several solutions :

1. Create a github action to log the PR Data (this repo)
   Pros : Serverless, no need to provision anything to AWS
   Cons : May hit 2000 minute free tier of github action
2. Create a dedicated lambda & API Gateway to log PR data (might use probot)
   Pros : Follow tvlk tech stack standard (AWS)
   Cons : Need to provision & everything

## How to use

1. Create `afrisal-pr-tracker.yml` in `.github/workflows/`  
   Please adjust `organization-name` according your organization name, here we use `traveloka` as org name

```yml
name: Afrisal PR Tracker

on:
  pull_request:
    types: [opened, closed]
  pull_request_review:
    types: [submitted]
jobs:
  log_event_time:
    runs-on: ubuntu-latest
    name: A job to track PR
    steps:
      - name: Log PR data
        id: hello
        uses: fawwaz/afrisal-pr-tracker-action@v0.2
        with:
          firebase-project-id: "${{ secrets.FIREBASE_PROJECT_ID }}"
          firebase-private-key-id: "${{ secrets.FIREBASE_PRIVATE_KEY_ID }}"
          firebase-private-key: "${{ secrets.FIREBASE_PRIVATE_KEY }}"
          firebase-client-email: "${{ secrets.FIREBASE_CLIENT_EMAIL }}"
          firebase-client-id: "${{ secrets.FIREBASE_CLIENT_ID }}"
          firebase-auth-uri: "${{ secrets.FIREBASE_AUTH_URI }}"
          firebase-token-uri: "${{ secrets.FIREBASE_TOKEN_URI }}"
          firebase-auth-provider-x-509-cert-url: "${{ secrets.FIREBASE_AUTH_PROVIDER_X509_CERT_URL }}"
          firebase-client-x-509-cert-url: "${{ secrets.FIREBASE_CLIENT_X509_CERT_URL }}"
          organization-name: "traveloka"
```

2. Go to firebase console, [retrieve serviceAccountKey.json](https://firebase.google.com/docs/admin/setup#initialize-sdk)

3. Set these github secrets keys according to the value in `serviceACcountKey.json`

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_CLIENT_ID
FIREBASE_AUTH_URI
FIREBASE_TOKEN_URI
FIREBASE_AUTH_PROVIDER_X509_CERT_URL
FIREBASE_CLIENT_X509_CERT_URL
```

## Roadmap/Todo

Pull request are welcomed

- [ ] Fix issue when there is untracked PR got reviewed. It will throw exception as this action try to `update` a firebase path that doesn't exist before.
- [ ] Multiple Reviews, currently the action only assume that there is only one reviewer which is wrong assumption given in `www` repo usually need multiple review from different teams.
- [ ] Proper storage while also consider a fair cost. I use my `personal` firebase account to log the data as I believe the free plan of firebase is more than enough to track the data. Provisioning dedicated RDS seems a bit overkill, while at the same time I believe there is a bettter solution over this `personal firebase` storage.
- [ ] Create a proper dashboard to display/visualize the data.
- [ ] Integration with `@afrisal` slack bot . Like sending reminder to fellow team member to review the PR
