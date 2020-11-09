const utils = require("./utils");
const github = require("@actions/github");

/**
 * Logging PR information
 */
const EVENT_TYPE = {
  OPENED: "opened",
  SUBMITTED: "submitted",
  CLOSED: "closed",
};

try {
  const { action } = github.context.payload;

  if (action === EVENT_TYPE.OPENED) {
    utils.handlePROpened(github.context.payload);
  } else if (action === EVENT_TYPE.SUBMITTED) {
    utils.handlePRSubmitted(github.context.payload);
  } else if (action === EVENT_TYPE.CLOSED) {
    utils.handlePRClosed(github.context.payload);
  }

  // Debugging purpose
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`-------\nDebug: The event payload\n-------\n\n`);
  console.log(payload);
} catch (error) {
  core.setFailed(error.message);
}
