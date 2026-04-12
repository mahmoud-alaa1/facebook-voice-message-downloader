import {
  getExtensionEnabledState,
  setExtensionEnabledState,
} from "@utils/extension-state";

const toggleButton = document.getElementById("toggle") as HTMLButtonElement;
const main = document.querySelector("main") as HTMLElement;
const stateLabel = document.getElementById("state-label") as HTMLSpanElement;
const stateHint = document.getElementById("state-hint") as HTMLSpanElement;
const status = document.getElementById("status") as HTMLParagraphElement;

function render(enabled: boolean): void {
  main.dataset.enabled = String(enabled);
  toggleButton.setAttribute("aria-pressed", String(enabled));
  stateLabel.textContent = enabled ? "Enabled" : "Disabled";
  stateHint.textContent = enabled
    ? "Voice message download buttons are active."
    : "Injection is paused until you turn it back on.";
  status.textContent = enabled
    ? "Download buttons will appear on supported messages."
    : "No buttons will be injected while disabled.";
}

async function handleToggleClick(): Promise<void> {
  const nextEnabled = main.dataset.enabled !== "true";
  toggleButton.disabled = true;

  try {
    await setExtensionEnabledState(nextEnabled);
    render(nextEnabled);
  } catch (error) {
    status.textContent =
      error instanceof Error ? error.message : "Failed to update setting.";
  } finally {
    toggleButton.disabled = false;
  }
}

async function initialize(): Promise<void> {
  const enabled = await getExtensionEnabledState();
  render(enabled);

  toggleButton.addEventListener("click", handleToggleClick);
}

void initialize();
