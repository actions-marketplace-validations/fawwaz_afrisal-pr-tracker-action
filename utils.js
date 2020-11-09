const core = require("@actions/core");

const projectId = core.getInput("firebase-project-id");
const privateKeyId = core.getInput("firebase-private-key-id");
const privateKey = core.getInput("firebase-private-key");
const clientEmail = core.getInput("firebase-client-email");
const clientId = core.getInput("firebase-client-id");
const authUri = core.getInput("firebase-auth-uri");
const tokenUri = core.getInput("firebase-token-uri");
const authProviderX509CertUrl = core.getInput(
  "firebase-auth-provider-x-509-cert-url"
);
const clientX509CertUrl = core.getInput("firebase-client-x-509-cert-url");
const organizationName = core.getInput("organization-name");

/**
 * Setup Firebase
 */
const firebase = require("firebase/app");
require("firebase/firestore");

const firebaseApp = firebase.initializeApp({
  type: "service_account",
  projectId,
  privateKeyId,
  privateKey,
  clientEmail,
  clientId,
  authUri,
  tokenUri,
  authProviderX509CertUrl,
  clientX509CertUrl,
});
const db = firebaseApp.firestore();

/**
 * Utils & Constants
 */

function getRepoName(rawRepoName) {
  return rawRepoName.replace(`${organizationName}/`, "");
}

const PR_STATE = {
  APPROVED: "approved",
  CHANGE_REQUESTED: "change_requested",
  COMMENTED: "commented",
};

/**
 * Handlers
 */

function handlePROpened(payload) {
  const {
    pull_request: {
      number,
      user,
      created_at,
      additions,
      deletions,
      changed_files,
    },
    repository,
  } = payload;

  const log = {
    prNumber: number,
    repository: getRepoName(repository.full_name),
    author: user.login,
    created_at: created_at,
    updated_at: "",
    merged_at: "",
    reviewer: "",
    addedLines: additions,
    removedLines: deletions,
    lineOfCode: additions - deletions,
    affectedFiles: changed_files,
    approved_at: "",
  };

  const docRef = db
    .collection("repositories")
    .doc(getRepoName(getRepoName(repository.full_name)))
    .collection("pull_requests")
    .doc(number.toString());

  docRef.set(log);
}

function handlePRSubmitted(payload) {
  const {
    review: { user: review_user, state, submitted_at },
    pull_request: { number, user: pr_user, created_at },
    repository,
  } = payload;

  if (state === PR_STATE.APPROVED) {
    const log = {
      prNumber: number,
      repository: getRepoName(repository.full_name),
      author: pr_user.login,
      created_at: created_at,
      merged_at: "",
      reviewer: review_user.login,
      approved_at: submitted_at,
    };

    const docRef = db
      .collection("repositories")
      .doc(getRepoName(getRepoName(repository.full_name)))
      .collection("pull_requests")
      .doc(number.toString());

    docRef.update(log);
  } else if (
    state === PR_STATE.CHANGE_REQUESTED ||
    state === PR_STATE.COMMENTED
  ) {
    // do something else possible feature : direct message slack ...
  }
}

function handlePRClosed(payload) {
  const {
    pull_request: { number, merged_at },
    repository,
  } = payload;

  const log = {
    prNumber: number,
    merged_at,
  };

  const docRef = db
    .collection("repositories")
    .doc(getRepoName(getRepoName(repository.full_name)))
    .collection("pull_requests")
    .doc(number.toString());

  docRef.update(log);
}

module.exports = {
  handlePRSubmitted,
  handlePROpened,
  handlePRClosed,
};
