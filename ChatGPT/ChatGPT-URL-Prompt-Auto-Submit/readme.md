# ChatGPT URL Prompt Auto Submit

Automatically submits the prefilled prompt when ChatGPT URL contains `?q=` or `?prompt=` parameters.

## Feature

When opening ChatGPT via URL with prefilled query parameters (such as `https://chatgpt.com/?q=your_prompt` or `https://chatgpt.com/?prompt=your_prompt`), ChatGPT fills the composer input but requires you to click send manually. This script watches the composer and automatically triggers the submit action once the page is ready.

## Supported composers

ChatGPT ships two composer implementations; both are supported:

| Composer | Input | Send button |
| --- | --- | --- |
| Classic | `textarea#prompt-textarea` | old `#composer-submit-button`; current builds drop the id and only keep `aria-label` |
| New (Codex-style) | `form[data-chatgpt-composer] div.ProseMirror[contenteditable="true"]` | no id/data-testid; the primary slot is `button.size-token-button-composer` (that slot holds the voice button while the input is empty) |

Lookup order:

1. explicitly marked send buttons (`#composer-submit-button`, `button[data-testid="send-button"]`);
2. buttons inside the composer `<form>` whose `aria-label` starts with a send verb (`Send` / `发送` / `送信` / `보내기` / `Enviar` / `Envoyer` / `Senden` …);
3. the composer primary action button (`size-token-button-composer` / `bg-composer-primary`), excluding voice and dictation buttons;
4. if none of the above exists (another UI revamp), dispatch a single Enter keydown into the input.

Other behavior:

- Never submits while the input is empty, so the voice button is not clicked by mistake.
- ChatGPT strips `?q=` from the address bar during load, so the script reads the parameter at `document-start` and falls back to the original URL from the navigation timing entry.
- Stops polling after submitting; gives up after 30 seconds.

## License

MIT
