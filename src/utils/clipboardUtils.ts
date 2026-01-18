/**
 * Copy text to clipboard with multiple fallback methods
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Method 1: Modern Clipboard API (requires secure context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Silently fail and try fallback - API might be blocked by permissions policy
      // This is not an error, just trying the next method
    }
  }
  
  // Method 2: Fallback using textarea + execCommand
  try {
    return copyUsingTextArea(text);
  } catch (err) {
    // All methods failed
    return false;
  }
};

/**
 * Fallback copy method using textarea and execCommand
 * @param text - Text to copy
 * @returns boolean - Success status
 */
const copyUsingTextArea = (text: string): boolean => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea invisible but accessible
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.style.opacity = '0';
  textArea.setAttribute('readonly', '');
  
  document.body.appendChild(textArea);
  
  // Focus and select the text
  textArea.focus();
  textArea.select();
  
  // For mobile devices
  textArea.setSelectionRange(0, text.length);
  
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    // Silently fail - this is just a fallback method
    success = false;
  }
  
  document.body.removeChild(textArea);
  return success;
};

/**
 * Copy text with user notification
 * Shows alert if all methods fail
 * @param text - Text to copy
 * @param label - Label for the text (e.g., "Email", "Password")
 * @returns Promise<boolean> - Success status
 */
export const copyToClipboardWithFeedback = async (
  text: string,
  label: string = 'Text'
): Promise<boolean> => {
  const success = await copyToClipboard(text);
  
  if (!success) {
    // Show alert as final fallback
    alert(`Failed to copy ${label} automatically.\n\nPlease copy manually:\n\n${text}`);
  }
  
  return success;
};

/**
 * Check if clipboard API is available
 * @returns boolean
 */
export const isClipboardAvailable = (): boolean => {
  return !!(navigator.clipboard && window.isSecureContext);
};

/**
 * Read text from clipboard (requires user permission)
 * @returns Promise<string | null>
 */
export const readFromClipboard = async (): Promise<string | null> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      const text = await navigator.clipboard.readText();
      return text;
    }
    return null;
  } catch (err) {
    console.error('Failed to read from clipboard:', err);
    return null;
  }
};

/**
 * Copy with visual feedback helper
 * Manages state for showing "Copied!" message
 * @param text - Text to copy
 * @param setCopied - State setter function
 * @param duration - How long to show "Copied!" message (ms)
 */
export const copyWithVisualFeedback = async (
  text: string,
  setCopied: (value: boolean) => void,
  duration: number = 2000
): Promise<void> => {
  const success = await copyToClipboard(text);
  
  if (success) {
    setCopied(true);
    setTimeout(() => setCopied(false), duration);
  } else {
    // Show alert as fallback
    alert(`Please copy manually:\n\n${text}`);
  }
};