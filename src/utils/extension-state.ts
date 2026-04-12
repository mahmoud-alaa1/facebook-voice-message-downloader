import { EXTENSION_ENABLED_STORAGE_KEY } from "./constants";

function toBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : true;
}

export async function getExtensionEnabledState(): Promise<boolean> {
  const result = await chrome.storage.local.get(EXTENSION_ENABLED_STORAGE_KEY);
  return toBoolean(result[EXTENSION_ENABLED_STORAGE_KEY]);
}

export async function setExtensionEnabledState(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [EXTENSION_ENABLED_STORAGE_KEY]: enabled });
}

export function onExtensionEnabledStateChanged(
  callback: (enabled: boolean) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== "local") return;
    const change = changes[EXTENSION_ENABLED_STORAGE_KEY];
    if (!change) return;
    callback(toBoolean(change.newValue));
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}