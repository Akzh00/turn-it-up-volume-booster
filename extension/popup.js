// The popup: a slider that sets the current tab's volume, 0–200%, and a reset button.
const slider = document.getElementById("volume");
const number = document.querySelector("#value .number");
const error = document.getElementById("error");
const resetButton = document.getElementById("reset");
const boosted = document.getElementById("boosted");

const FAILED = "Something went wrong. Try again.";

// The last volume the extension confirmed: what the tab really plays at.
let confirmed = 100;

function show(volume) {
  slider.value = volume;
  slider.setAttribute("aria-valuetext", `${volume} percent`);
  number.textContent = volume;
  boosted.hidden = volume <= 100;
}

chrome.runtime.sendMessage({ type: "warm" });

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
confirmed = (await chrome.runtime.sendMessage({ type: "get-volume", tabId: tab.id })).volume;
show(confirmed);

async function apply(volume) {
  show(volume);
  let reply;
  try {
    reply = await chrome.runtime.sendMessage({ type: "set-volume", tabId: tab.id, volume });
  } catch {
    reply = { error: FAILED };
  }
  error.textContent = reply?.error ?? "";
  // The slider must never show a volume the tab isn't playing at.
  if (reply?.error) show(confirmed);
  else confirmed = volume;
}

slider.addEventListener("input", () => apply(Number(slider.value)));
resetButton.addEventListener("click", () => apply(100));
