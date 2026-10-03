// Background: remembers each tab's volume and hands the sound work to the offscreen page.
// A tab is only captured once its volume is first moved away from 100%.

let queue = Promise.resolve();

chrome.action.setBadgeBackgroundColor({ color: "#8fe0d0" });
chrome.action.setBadgeTextColor({ color: "#14162b" });

// One change at a time, so dragging the slider fast can't start two captures of the same tab.
function inOrder(job) {
  const result = queue.then(job);
  queue = result.catch(() => {});
  return result;
}

async function getVolumes() {
  const { volumes = {} } = await chrome.storage.session.get("volumes");
  return volumes;
}

async function saveVolume(tabId, volume) {
  const volumes = await getVolumes();
  if (volume === null) delete volumes[tabId];
  else volumes[tabId] = volume;
  await chrome.storage.session.set({ volumes });
}

// The number on the toolbar icon, shown while a tab is not at 100%. Chrome clears it when the tab loads a page.
async function showBadge(tabId, volume) {
  try {
    await chrome.action.setBadgeText({ tabId, text: volume === null || volume === 100 ? "" : String(volume) });
  } catch {
    // The tab is already closed.
  }
}

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Plays the tab's sound at the chosen volume.",
  });
}

function toOffscreen(message) {
  return chrome.runtime.sendMessage({ target: "offscreen", ...message });
}

async function setVolume(tabId, volume) {
  // The popup only ever sends whole numbers from 0 to 200 for a real tab; refuse anything else.
  if (!Number.isInteger(tabId) || !Number.isInteger(volume) || volume < 0 || volume > 200) {
    return { error: "Invalid volume." };
  }
  await ensureOffscreen();
  const { found } = await toOffscreen({ type: "set", tabId, volume });
  if (!found && volume !== 100) {
    let streamId;
    try {
      streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
    } catch {
      return { error: "Can't change the volume on this page." };
    }
    const reply = await toOffscreen({ type: "start", tabId, streamId, volume });
    if (reply?.error) return { error: "Can't change the volume on this page." };
  }
  await showBadge(tabId, volume);
  await saveVolume(tabId, volume);
  return {};
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === "offscreen") return;
  if (message.type === "get-volume") {
    getVolumes().then((volumes) => sendResponse({ volume: volumes[message.tabId] ?? 100 }));
    return true;
  }
  if (message.type === "set-volume") {
    inOrder(() => setVolume(message.tabId, message.volume)).then(sendResponse, (e) => {
      console.error(e);
      sendResponse({ error: "Something went wrong. Try again." });
    });
    return true;
  }
  if (message.type === "warm") {
    // The popup just opened: get the sound output ready, so the first boost starts without a gap.
    inOrder(async () => {
      await ensureOffscreen();
      await toOffscreen({ type: "warm" });
    });
    return;
  }
  if (message.type === "capture-ended") {
    inOrder(async () => {
      await showBadge(message.tabId, null);
      await saveVolume(message.tabId, null);
    });
    return;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, change) => {
  if (change.status !== "loading") return;
  const volume = (await getVolumes())[tabId];
  if (volume !== undefined) showBadge(tabId, volume);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  inOrder(() => saveVolume(tabId, null));
});
