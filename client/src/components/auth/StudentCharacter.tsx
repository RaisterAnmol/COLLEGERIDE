import React from 'react';

export interface StudentCharacterProps {
  isPasswordFocused?: boolean;
  isTextFocused?: boolean;
  textValue?: string;
  passwordValue?: string;
  size?: number;
  lookDirection?: "left" | "right";
  speechOverride?: string;
  showSpeech?: boolean;
}

/**
 * Mascot permanently retired per user instruction.
 * Returns null to eliminate all cartoon companion elements.
 */
export const StudentCharacter: React.FC<StudentCharacterProps> = () => {
  return null;
};

export default StudentCharacter;
