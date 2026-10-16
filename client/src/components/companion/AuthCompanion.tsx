import React from "react";

export type CompanionState =
  | "IDLE"
  | "WATCHING_EMAIL"
  | "EMAIL_VALID"
  | "EMAIL_INVALID"
  | "WATCHING_PASSWORD"
  | "PASSWORD_COMPLETE"
  | "ERROR"
  | "SUCCESS"
  | "GUIDING";

interface AuthCompanionProps {
  state: CompanionState;
  className?: string;
  speechText?: string;
}

/**
 * Mascot companion permanently retired per user instruction.
 * Returns null to eliminate all cartoon companion elements.
 */
export const AuthCompanion: React.FC<AuthCompanionProps> = () => {
  return null;
};
