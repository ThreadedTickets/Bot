export interface CommandCache {
  [commandName: string]: {
    mtime: number; // last modified time
    isGuild: boolean;
  };
}
