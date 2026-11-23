# AI Chat URL Prompt Auto Submit

Automatically submits the prompt passed in the URL through `?q=` or `?prompt=`, on both ChatGPT and Gemini.

## Feature

Open a chat with a prefilled prompt from a URL and the script submits it once the composer is ready:

- `https://chatgpt.com/?q=your_prompt`
- `https://chatgpt.com/?prompt=your_prompt`
- `https://gemini.google.com/app?q=your_prompt`
- `https://gemini.google.com/app?prompt=your_prompt`

## How each site is handled

ChatGPT supports the URL parameters natively and fills its own composer; the script only waits for that prefill and presses send.

Gemini ignores `?q=` / `?prompt=` (verified on the live app: the composer stays empty), so the script fills the Quill editor itself and then submits:

1. wait for `rich-textarea div.ql-editor[contenteditable="true"]`;
2. insert the prompt with `document.execCommand('insertText')`; if that fails (for example in a background tab without focus), build the paragraph DOM and dispatch an `input` event;
3. click the composer's send button (`aria-label` starting with `Send` / `发送` / `送信` …);
4. verify the message was actually sent (editor cleared, stop button appeared, or the user message is rendered) and retry the click up to 3 times if it was lost;
5. if no usable send button exists after 5 seconds, press Enter once per retry.

Only the new-chat page (`/app`) is handled on Gemini. Conversation pages (`/app/<conversationId>?q=…`) are skipped, so refreshing a sent conversation does not submit the prompt again. After submitting, `q` / `prompt` are removed from the URL; Gemini's router re-adds them when it navigates to the conversation, so the script also intercepts `history.pushState` / `replaceState` and strips them again.

## Send button lookup

| Site | Lookup order |
| --- | --- |
| ChatGPT (classic) | `#composer-submit-button` / `button[data-testid="send-button"]` → `aria-label` send verb inside the composer form → `size-token-button-composer` / `bg-composer-primary` (voice buttons excluded) |
| ChatGPT (new ProseMirror composer) | same as above, with `form[data-chatgpt-composer] div.ProseMirror[contenteditable="true"]` as the editor |
| Gemini | visible `button[aria-label]` inside `.input-area` whose label starts with a send verb, never a stop/voice button |

Primary action buttons that are voice/dictation/stop controls are never clicked.

## Other behavior

- Never submits an empty composer, so the Gemini voice button is not clicked by mistake.
- On Gemini, if the user typed something before the script filled the composer, it leaves the draft alone and skips submission.
- ChatGPT may strip `?q=` from the address bar while loading; the script reads the parameter at `document-start` and falls back to the original URL from the navigation timing entry.
- Stops polling after submitting; gives up after 30 seconds.
- Multi-line prompts work on both sites (`execCommand` produces one paragraph per line on Gemini).

## Notes

- Language coverage of send-button labels is a best-effort list (`Send`, `发送`, `傳送`, `送信`, `보내기`, `Enviar`, `Envoyer`, `Senden`, `Invia`, `Отправить`, `Verzenden`).
- `@grant none` keeps the script in the page context, which the Gemini history interception relies on. If a manager forces a sandbox, the URL cleanup may not run, but the `/app/<id>` path guard still prevents resubmission after a refresh.

## License

MIT
