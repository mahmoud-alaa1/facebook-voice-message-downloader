/**
 * Messaging contract
 *
 * Layered but simple structure:
 * 1) Protocol types come from protocol/messages
 * 2) Senders are defined in this file
 * 3) Router is defined in this file
 */

import { BackgroundToContentMessage } from "@protocol/background-to-content";
import { ContentToBackgroundMessage } from "@protocol/content-to-background";
import { DownloadResponse, GenericResponse } from "@protocol/responses";

export type ContentMessage = ContentToBackgroundMessage;
export type BackgroundMessage = BackgroundToContentMessage;

type ExtractAction<T, A extends string> = T extends { action: A } ? T : never;
type Payload<T extends { action: string }> = Omit<T, "action">;

function send<M extends { action: string }>(message: M): void {
  chrome.runtime.sendMessage(message);
}

function sendWithResponse<M extends { action: string }, R>(
  message: M,
  callback: (response: R) => void,
): void {
  chrome.runtime.sendMessage(message, callback);
}

function sendToTab<M extends { action: string }>(
  tabId: number,
  message: M,
): void {
  chrome.tabs.sendMessage(tabId, message).catch(() => {
    // Tab may not have a content script loaded yet.
  });
}

export const Messages = {
  registerElement(
    payload: Payload<ExtractAction<ContentMessage, "registerElement">>,
  ): void {
    send<ContentMessage>({ action: "registerElement", ...payload });
  },

  registerAudioUrl(
    payload: Payload<ExtractAction<ContentMessage, "registerAudioUrl">>,
  ): void {
    send<ContentMessage>({ action: "registerAudioUrl", ...payload });
  },

  requestDownload(
    payload: Payload<ExtractAction<ContentMessage, "uiDownloadClicked">>,
    callback: (response: DownloadResponse) => void,
  ): void {
    sendWithResponse<ContentMessage, DownloadResponse>(
      { action: "uiDownloadClicked", ...payload },
      callback,
    );
  },

  background: {
    analyzeAudioUrl(
      tabId: number,
      payload: Payload<ExtractAction<BackgroundMessage, "analyzeAudioUrl">>,
    ): void {
      sendToTab<BackgroundMessage>(tabId, {
        action: "analyzeAudioUrl",
        ...payload,
      });
    },
  },
} as const;

type MessageHandler<A extends ContentMessage["action"]> = (
  message: ExtractAction<ContentMessage, A>,
  sendResponse: (response: GenericResponse | DownloadResponse) => void,
) => boolean | void;

export type HandlerMap = {
  [A in ContentMessage["action"]]?: MessageHandler<A>;
};

export function createMessageRouter(handlers: HandlerMap): void {
  function dispatchByAction<A extends ContentMessage["action"]>(
    message: ExtractAction<ContentMessage, A>,
    sendResponse: (response: GenericResponse | DownloadResponse) => void,
  ): boolean {
    const handler = handlers[message.action] as MessageHandler<A> | undefined;

    if (!handler) {
      sendResponse({ success: false, error: "Unknown action" });
      return false;
    }

    return handler(message, sendResponse) ?? false;
  }

  chrome.runtime.onMessage.addListener(
    (message: ContentMessage, _sender, sendResponse) => {
      try {
        switch (message.action) {
          case "registerElement":
            return dispatchByAction(message, sendResponse);
          case "registerAudioUrl":
            return dispatchByAction(message, sendResponse);
          case "uiDownloadClicked":
            return dispatchByAction(message, sendResponse);
          default: {
            const _never: never = message;
            void _never;
            sendResponse({ success: false, error: "Unknown action" });
            return false;
          }
        }
      } catch (err) {
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
        return false;
      }
    },
  );
}
