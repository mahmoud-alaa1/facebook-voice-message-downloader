import { EXTENSION_ENABLED_STORAGE_KEY } from "./constants";

/**
 * Retrieves the current enabled state of the extension from storage
 * @returns
 */
export async function getExtensionEnabledState(): Promise<boolean> {
  const result = await chrome.storage.local.get(EXTENSION_ENABLED_STORAGE_KEY);
  return result[EXTENSION_ENABLED_STORAGE_KEY] === true;
}

/**
 * this function updates the enabled state in storage, which will trigger the scanner to start/stop via the onExtensionEnabledStateChanged listener
 * @param enabled
 */
export async function setExtensionEnabledState(
  enabled: boolean,
): Promise<void> {
  await chrome.storage.local.set({ [EXTENSION_ENABLED_STORAGE_KEY]: enabled });
}

/**
 *
 * @param callback the callback to invoke when the enabled state changes
 * @returns the listener remover
 */
export function onExtensionEnabledStateChanged(
  callback: (enabled: boolean) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== "local") {
      return;
    }

    const change = changes[EXTENSION_ENABLED_STORAGE_KEY];
    if (!change) {
      return;
    }

    callback(change.newValue === true);
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
