export type ApplicationQuestion = {
  question: string;
  type: "number" | "text" | "choice";
  message: string | null;
  minimum: number | null;
  maximum: number | null;
  choices: string[] | null;
};

export type Application = {
  _id: string;
  server: string;
  questions: ApplicationQuestion[];
  name: string;
  groups: string[];
  blacklistRoles: string[];
  addRolesOnAccept: string[];
  removeRolesOnAccept: string[];
  addRolesOnReject: string[];
  removeRolesOnReject: string[];
  addRolesWhenPending: string[];
  removeRolesWhenPending: string[];
  pingRoles: string[];
  requiredRoles: string[];
  acceptingResponses: boolean;

  acceptedMessage: string | null;
  rejectedMessage: string | null;
  submissionMessage: string | null;
  confirmationMessage: string | null;
  cancelMessage: string | null;
  submissionsChannel: string | null;
  sendCopyOfApplicationInTicket: boolean;
  open: string | null;
  close: string | null;
  applicationLimit: number;
  allowedAttempts: number;
  applicationCooldown: number;
  actionOnUserLeave: "nothing" | "delete" | "approve" | "reject";
  linkedTicketTrigger: string | null;
};
