export type TicketFormResponse = {
  question: string;
  response: string;
};

export type Ticket = {
  _id: string;
  server: string;
  trigger: string;
  status: "Open" | "Closed" | "Locked";
  owner: string;
  groups: string[];
  channel: string;
  allowAutoResponders: boolean;
  closeChannel: string;
  categoriesAvailableToMoveTicketsTo: string[];
  takeTranscripts: boolean;
  responses: TicketFormResponse[];
  addRolesOnOpen: string[];
  addRolesOnClose: string[];
  removeRolesOnOpen: string[];
  removeRolesOnClose: string[];
  allowRaising: boolean;
  isRaised: boolean;
  allowReopening: boolean;
  syncChannelPermissionsWhenMoved: boolean;
  closeOnLeave: boolean;
};

export type TicketForm = {
  question: string;
  multilineResponse: boolean;
  requiredResponse: boolean;
  minimumCharactersRequired: number;
  maximumCharactersRequired: number;
  placeholder: string;
  defaultValue: string;
};

export type TicketTrigger = {
  _id: string;
  server: string;
  label: string;
  description: string | null;
  emoji: string | null;
  colour: number;
  userLimit: number;
  serverLimit: number;
  message: string;
  form: TicketForm[];
  groups: string[];
  categoriesAvailableToMoveTicketsTo: string[];
  openChannel: string;
  closeChannel: string;
  channelNameFormat: string;
  isThread: boolean;
  hideUsersInTranscript: boolean;
  allowRaising: boolean;
  allowReopening: boolean;
  closeOnLeave: boolean;
  defaultToRaised: boolean;
  takeTranscripts: boolean;
  allowAutoresponders: boolean;
  syncChannelPermissionsWhenMoved: boolean;
  sendCopyOfFormInTicket: boolean;
  addRolesOnOpen: string[];
  addRolesOnClose: string[];
  removeRolesOnOpen: string[];
  removeRolesOnClose: string[];
  requiredRoles: string[];
  bannedRoles: string[];
  notifyStaff: string[];
};
