export const lang = {
  MISSING_PERMISSIONS: "You do not have permission to perform this action",
  NO_ANNOUNCEMENT: "There is not currently an announcement to view",
  ERROR_CODE_HELP_TITLE: "Error Information: **{error_code}**",
  ERROR_CODE_0001:
    "This error code means that when you tried to edit a message using the web editor and pressed export, Threaded was then unable to find that message.\nThis was likely caused by someone deleting the message while it was being edited",
  ERROR_CODE_0002:
    "This error was caused by the document Threaded was trying to access at the time being missing. It may be temporary or permanent depending on what Threaded was trying to access.",
  ERROR_CODE_0003:
    "This error means that you are exceeding one of Threaded's limits for a certain feature",
  ERROR_CODE_0004:
    "This will only be shown if you have tried to modify the data being sent between the website and bot",

  ERROR_CODE_1001:
    "Your account has a role that is blacklisted from taking this application",
  ERROR_CODE_1002:
    "Your account does not have all the required roles to take this application",
  ERROR_CODE_1003: "The limit for the number of applicants has been reached",
  ERROR_CODE_1004: "You are not allowed to take this application again",
  ERROR_CODE_1005:
    "You are on cooldown for taking this application, try again in a little while",
  ERROR_CODE_1006: "This application is not currently accepting responses",
  ERROR_CODE_1007:
    "You are already attempting an application, finish or cancel it before starting another",
  ERROR_CODE_1008: "You are not currently completing an application",
  ERROR_CODE_1009:
    "The given response was too short. It must be at least {min} characters",
  ERROR_CODE_1010:
    "The given response was too long. It must be at most {max} characters",

  ERROR_CODE_1011: "The given response was too low. It must be at least {min}",
  ERROR_CODE_1012: "The given response was too high. It must be at most {max}",
  ERROR_CODE_1013: "This response must be a number",
  ERROR_CODE_1014: "Threaded does not support file uploads at the moment",

  ERROR_CODE_2001:
    "You have a role that is blacklisted from using this ticket trigger",
  ERROR_CODE_2002:
    "You do not have all the required roles to use this ticket trigger",
  ERROR_CODE_2003: "Ticket limit (all users) reached for this trigger",
  ERROR_CODE_2004: "You have reached your ticket limit for this trigger",
  ERROR_CODE_2005: "Server has reached the 500 channel limit",
  ERROR_CODE_2006: "Invalid parent",
  ERROR_CODE_2007: "Parent not found",
  ERROR_CODE_2008: "Category has reached limit of 50 channels",
  ERROR_CODE_2009: "Thread must be created in a text channel",
  ERROR_CODE_2010: "Missing permission to create threads",
  ERROR_CODE_2011: "Channel has too many active threads",
  ERROR_CODE_2012: "Missing permission to create channels",
  ERROR_CODE_2013: "Missing user",
  ERROR_CODE_2014: "Can't fetch member",
  ERROR_CODE_2015: "Failed to create ticket: {error}",

  TICKET_PIN_MESSAGE_COMPONENTS_CLOSE: "Close",
  TICKET_PIN_MESSAGE_COMPONENTS_LOCK: "Lock",
  TICKET_PIN_MESSAGE_COMPONENTS_UNLOCK: "Unlock",
  TICKET_PIN_MESSAGE_COMPONENTS_REOPEN: "Reopen",
  TICKET_PIN_MESSAGE_COMPONENTS_RAISE: "Raise",
  TICKET_PIN_MESSAGE_COMPONENTS_LOWER: "Lower",

  SCHEDULE_TICKET_CLOSE:
    "This ticket has been scheduled to close in {duration}",
  SCHEDULE_TICKET_CLOSE_ALREADY:
    "This ticket has already been scheduled to close",
  TICKET_NOT_FOUND: "I could not find this ticket",
  TICKET_ALREADY_RAISED: "This ticket is already raised",
  TICKET_DOES_NOT_ALLOW_RAISE: "This ticket is already raised",
  TICKET_ALREADY_LOWERED: "This ticket is not raised",
  TICKET_RAISED: "This ticket has been raised",
  TICKET_LOWERED: "This ticket has been lowered",
  TICKET_RAISE_LOG_BODY: `A ticket for {user} has been raised. This means that the transcript is now locked`,
  TICKET_RAISE_LOG_TITLE: `Ticket Raised`,
  TICKET_LOWER_LOG_BODY: `A ticket for {user} has been lowered. This means that the transcript is now unlocked`,
  TICKET_LOWER_LOG_TITLE: `Ticket Lowered`,
  NEW_TICKET_LOG_TITLE: "New Ticket",
  NEW_TICKET_LOG_BODY: `A new ticket for {user} has been made using the ticket trigger {trigger}`,
  TICKET_CLOSE_LOG_BODY: `A ticket for {user} has been closed. If there is one, the transcript ID is \`{id}\``,
  TICKET_CLOSE_LOG_TITLE: `Ticket Closed`,
  TICKET_CLOSE_REOPEN_MESSAGE:
    "This ticket has been scheduled to close in {duration}",
  TICKET_REOPEN_LOG_TITLE: `Ticket Reopened`,
  TICKET_REOPEN_REOPEN_MESSAGE: "A ticket for {user} has been reopened",
  TICKET_REOPEN: "I have reopened this ticket",
  TICKET_LOCK_LOG_TITLE: `Ticket Locked`,
  TICKET_LOCK_REOPEN_MESSAGE: "A ticket for {user} has been locked",
  TICKET_LOCK: "I have locked this ticket",
  TICKET_CLOSED_SO_CANNOT_LOCK:
    "This ticket has been scheduled to close so cannot be locked",
  TICKET_UNLOCK_LOG_TITLE: `Ticket Unlocked`,
  TICKET_UNLOCK_REOPEN_MESSAGE: "A ticket for {user} has been unlocked",
  TICKET_UNLOCK: "I have unlocked this ticket",
  TICKET_NOT_LOCKED: "This ticket is not locked",
  TICKET_LOCKED_SO_CANNOT_LOCK: "This ticket is already locked",

  APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON:
    "Want your own application? Add Threaded!",

  BLACKLISTED_SERVER: `This server has been blacklisted from using Threaded for: {reason}`,
  BLACKLISTED_USER:
    "You have been blacklisted from using Threaded for: {reason}",

  TICKET_CREATE_PERFORMING_CHECKS: "Performing permission checks",
  TICKET_CREATE_CHECKS_PASSED:
    "Checks passed, creating ticket\n-# Only a single ticket can be created at a time per server, you may be part of a queue if this takes a while",
  TICKET_CREATE_DONE: "Your ticket has been made!",
  TICKET_CREATE_BUTTON_LABEL: "Go to ticket",

  REOPEN_NOT_SUPPORTED: "This ticket cannot be reopened",

  NO_CLOSE_OWN_TICKET: "You can't close your own ticket",
  TICKET_ALREADY_OPEN:
    "This ticket is already open - if permission changes don't appear to be happening, this may be because of Discord rate limits. Threaded will sort it out *eventually*",

  APPLICATION_PENDING_CHECKS: "Just doing some checks",

  THINK: "Just give me a second to think...",

  SUPPORT_SERVER: "Support Server",
  INVALID_CHANNEL_TYPE: "That is not a valid channel type",
  LOG_CHANNEL_SET_AND_ENABLED: "I have set and enabled that log channel!",
  LOG_CHANNEL_SET_AND_DISABLED: "I have set and disabled that log channel!",
  LOG_CHANNEL_SET: "I have set that log channel!",
  LOG_CHANNEL_UNSET: "I have unset and disabled that log channel!",
  LOG_CHANNEL_ENABLED: "I have enabled that log channel!",
  LOG_CHANNEL_DISABLED: "I have disabled that log channel!",
  TEST_NOTIFICATION_ALSO_SENT: "I have also sent a test notification!",
  TEST_NOTIFICATION: "This is a test log event!",
  UNABLE_TO_FIND_LOG_CATEGORY: "I could not find that log category",
  LOG_CHANNEL_SETUP_PROVIDE_STATUS_OR_CHANNEL:
    "Please provide either a channel or a status",

  LOG_COMMAND_VIEW_TITLE: "Your current logging setup",
  LOG_COMMAND_VIEW_GENERAL_FIELD_NAME: "General Logs",
  LOG_COMMAND_VIEW_GENERAL_FIELD_VALUE:
    "{general_status} General logs: {general_logs}\n> Any logs that have been enabled but have no chanel will be sent here",
  LOG_COMMAND_VIEW_TICKET_FIELD_NAME: "Ticket Logs",
  LOG_COMMAND_VIEW_TICKET_FIELD_VALUE:
    "{feedback_status} Feedback Logs: {feedback_logs}\n{open_status} Open Logs: {open_logs}\n{close_status} Close Logs: {close_logs}\n{move_status} Move Logs: {move_logs}\n{lock_status} Lock Logs: {lock_logs}\n{unlock_status} Unlock Logs: {unlock_logs}\n{raise_status} Raise Logs: {raise_logs}\n{lower_status} Lower Logs: {lower_logs}\n{transcript_status} Transcript Logs: {transcript_logs}",
  LOG_COMMAND_VIEW_APPLICATION_FIELD_NAME: "Application Logs",
  LOG_COMMAND_VIEW_APPLICATION_FIELD_VALUE:
    "{create_status} Submission Logs: {create_logs}\n{approve_status} Approval Logs: {approve_logs}\n{reject_status} Rejection Logs: {reject_logs}\n{delete_status} Deletion Logs: {delete_logs}\n",

  ERROR_TITLE: "Looks like something went wrong",
  ERROR_DESCRIPTION:
    "```\n{error_message}\n```\n-# If you need any help, don't hesitate to contact us in the {support_server} with this error code: {error_code}",

  LANGUAGE_UPDATED:
    "The preferred language for this server has been updated to `{new_language}`",
  COMMANDS_TRANSLATE_MESSAGE_TRANSLATED: "Here is your translated message:",
  COMMANDS_TRANSLATE_NO_CONTENT_TO_TRANSLATE:
    "This message does not have any content for me to translate!",

  PROCESSING_PANEL:
    "I am processing your panel. It will be sent in this channel when I am done",
  NO_RECORDS: "I was not able to find any records matching your query",

  SET_AUTO_RESPONDER_ALLOWED_CHANNELS:
    "Use the below dropdown to set which channels your auto responders will work in",
  CONFIG_CREATE_MESSAGE_NOT_FOUND: "I could not find a message with that name",
  CONFIG_CREATE_GROUP_NOT_FOUND: "I could not find a group with that name",
  CONFIG_CREATE_APPLICATION_NOT_FOUND:
    "I could not find an application with that name",
  CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND:
    "I could not find a ticket trigger with that name",
  MESSAGE_CANNOT_SEND_AS_INVALID:
    "I was unable to send that message as it is malformed",
  MESSAGE_NAME_NOT_VALID:
    "Your message name can only include alpha numeric characters, '-', '_' and spaces",
  MESSAGE_CREATE_GOTO_LINK:
    "Head to {link} to edit your message\n-# DO NOT share this link with anyone otherwise they will be able to create messages on your server",
  GROUP_CREATE_GOTO_LINK:
    "Head to {link} to edit your group\n-# DO NOT share this link with anyone otherwise they will be able to create groups on your server",
  APPLICATION_CREATE_GOTO_LINK:
    "Head to {link} to edit your application\n-# DO NOT share this link with anyone otherwise they will be able to create applications on your server",
  TICKET_TRIGGER_CREATE_GOTO_LINK:
    "Head to {link} to edit your ticket trigger\n-# DO NOT share this link with anyone otherwise they will be able to create triggers on your server",
  MESSAGE_DELETED: "I have deleted that message!",
  GROUP_DELETED: "I have deleted that group!",
  APPLICATION_DELETED: "I have deleted that application!",
  TICKET_TRIGGER_DELETED: "I have deleted that trigger!",
  TAGS_LIMIT_REACHED: "You have reached the tag limit!",
  RESPONDERS_LIMIT_REACHED: "You have reached the auto responder limit!",
  INVALID_MATCHER_REGEX:
    "The matcher regex you provided is invalid. Make sure that the regex string is valid and does not contain excessive backtracking",
  RESPONDER_CREATED: "I have created your auto responder!",
  RESPONDER_NOT_FOUND: "That auto responder doesn't exist",
  TAG_CREATED: "I have created your tag!",
  TAG_UPDATE_NO_OPTIONS: "Please provide either a new name or new message",
  RESPONDER_UPDATE_NO_OPTIONS: "Please provide at least 1 value to edit",
  TAG_UPDATED: "I have updated your tag!",
  RESPONDER_UPDATED: "I have updated your responder!",
  TAG_DELETED: "I have deleted your tag!",
  RESPONDER_DELETED: "I have deleted your responder!",
  TAG_NOT_FOUND: "I can't find a tag by that name",
  TAG_MESSAGE_NOT_FOUND: "The message linked to this tag no longer exists",

  RESPONDER_INFO_TITLE: "Auto Responder Information",
  MATCHER_TYPE: "Matcher Type",
  TICKET_CANT_MOVE: "This ticket cannot be moved",
  INVALID_CHANNEL: "Invalid channel",
  TICKET_MOVED: "Moved the ticket successfully",

  CLOSE_MASS_ACTION:
    "Closing {number} tickets for {user} (This may take some time)",
  CLOSE_MASS_ACTION_DONE:
    "Closed {number} tickets for {user} - {failed} tickets failed to close (this may be due to permission issues)",

  TICKET_CLOSE_WITH_TRANSCRIPT_LOG_TITLE: "New Ticket Transcript",
  TICKET_CLOSE_WITH_TRANSCRIPT_LOG_BODY:
    "Attached is a ticket transcript for {user}'s recent ticket on `{id}`",
  TRANSCRIPT_NOT_FOUND: "I could not find this transcript",

  DEBUGGER_GROUP_PERMISSIONS_TITLE: "Group Permissions Debugger",
  DEBUGGER_GROUP_PERMISSIONS_BODY:
    'These permissions are only for the general server, note that things like applications and ticket triggers may use a different set of groups that they have been assigned. As a result, the permissions for "applications" and "tickets" are not relevant - if a value is true it simply means that one of the groups you are in grants you that permission. For it to actually take effect, it would need to be assigned as a group on an application or ticket.',

  MATCHER_TYPE_EXACT: "Exact",
  MATCHER_TYPE_INCLUDES: "Includes",
  MATCHER_TYPE_STARTS: "Starts with",
  MATCHER_TYPE_ENDS: "Ends with",
  MATCHER_TYPE_REGEX: "Regex",

  MATCHER_SCOPES: "Matcher Scopes",
  MATCHER_SCOPES_CLEAN: "Remove emojis and markdown: ",
  MATCHER_SCOPES_NORMALIZE: "Process as lowercase: ",
  MATCHER: "Match String",
  MATCHER_MATCH_EXAMPLE: "Example match",

  YES: "Yes",
  NO: "No",
  GOTO_DMS: "DMs",
  LEFT_SERVER: "Left the server",

  APPLICATION_NOT_PENDING: "This application isn't pending",
  NEW_APPLICATION_LOG_TITLE: "New Application",
  NEW_APPLICATION_SUBMIT_TITLE: "New Application for {application}",
  DELETE_APPLICATION_LOG_BODY: "{staff} deleted an application by {user}",
  DELETE_APPLICATION_LOG_TITLE: "Application Deleted!",
  ACCEPT_APPLICATION_LOG_BODY: "{staff} accepted an application by {user}",
  ACCEPT_APPLICATION_LOG_TITLE: "Application Accepted!",
  REJECT_APPLICATION_LOG_BODY: "{staff} rejected an application by {user}",
  REJECT_APPLICATION_LOG_TITLE: "Application Rejected!",
  NEW_APPLICATION_SUBMIT_BODY_OWNER: "Submitted by: {user}",
  NEW_APPLICATION_SUBMIT_BODY_DURATION: "Application took {duration}",
  NEW_APPLICATION_SUBMIT_BODY_INFORMATION:
    "View the application in the attached thread!",
  NEW_APPLICATION_LOG_BODY:
    "{user} has submitted an application for {application}",
  APPLICATION_DIRECT_TO_DMS:
    "Head over to your DMs to start the application!\n-# If you do not get a DM, please check that you have DMs enabled for this server",
  APPLICATION_IDS_DO_NOT_MATCH:
    "Looks like we're out of sync, this application ID does not match with the one that I thought you were doing. Try canceling and starting again ._.",
  APPLICATION_DEFAULT_MESSAGE_CONFIRMATION:
    "Are you sure you want to start the application for {applicationName}? You can cancel at any time by replying with `cancel`",
  APPLICATION_DEFAULT_MESSAGE_CANCELED:
    "I have canceled your application for {applicationName}. You can restart the application from the same place that you started it!",
  APPLICATION_DEFAULT_MESSAGE_SUBMITTED:
    "Your application for {applicationName} has been submitted!",
  APPLICATION_DEFAULT_MESSAGE_ACCEPTED:
    "Your application for {applicationName} in {serverName} has been accepted! The reviewer gave the following reason: {reason}",
  APPLICATION_DEFAULT_MESSAGE_REJECTED:
    "Your application for {applicationName} in {server.name} has been rejected! The reviewer gave the following reason: {reason}",
  APPLICATION_VERDICT_ACCEPT_HEADER:
    "Application accepted by {user} with the reason {reason}",
  APPLICATION_VERDICT_REJECT_HEADER:
    "Application rejected by {user} with the reason {reason}",

  TICKET_CLOSE_DM_BUTTON: "Want your own ticket system? Invite Threaded!",
};
