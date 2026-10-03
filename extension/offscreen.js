// Offscreen page: receives a captured tab's sound and plays it back at the chosen volume.
// While a tab is captured, Chrome mutes it — what you hear comes from here.

const tabs = new Map(); // tabId -> { stream, gain, limiter }

// Anti-crackle: a limiter that only turns down the peaks that would go past full volume.
// Chrome's compressor also lifts everything by a fixed "makeup" amount; LEVEL cancels that out,
// so sound that isn't too loud comes out at exactly the chosen volume.
const THRESHOLD = -3; // dB
const RATIO = 20;
const LEVEL = 10 ** ((0.6 * THRESHOLD * (1 - 1 / RATIO)) / 20);

// Fade-in when a capture starts, so the hand-over from the tab is a dip, not a jolt.
const FADE_IN = 0.03; // seconds

function level(volume) {
  return (volume / 100) * LEVEL;
}

// One audio output shared by all boosted tabs. Opened early (when the popup opens),
// because opening it is the slow part of starting a boost.
let context;

async function output() {
  context ??= new AudioContext();
  if (context.state !== "running") await context.resume();
  return context;
}

async function start(tabId, streamId, volume) {
  const [stream] = await Promise.all([
    navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } },
    }),
    output(),
  ]);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(level(volume), context.currentTime + FADE_IN);
  const limiter = new DynamicsCompressorNode(context, {
    threshold: THRESHOLD,
    ratio: RATIO,
    knee: 0,
    attack: 0.002,
    release: 0.15,
  });
  context.createMediaStreamSource(stream).connect(gain).connect(limiter).connect(context.destination);
  // Chrome can end the capture by itself (tab closed, discarded or crashed): forget the volume too.
  stream.getAudioTracks()[0].addEventListener("ended", () => {
    stop(tabId);
    chrome.runtime.sendMessage({ type: "capture-ended", tabId });
  });
  tabs.set(tabId, { stream, gain, limiter });
}

function set(tabId, volume) {
  const tab = tabs.get(tabId);
  if (!tab) return false;
  // A short glide instead of a jump, so moving the slider doesn't click.
  const gain = tab.gain.gain;
  // Take over from a fade-in that may still be running, or its end point would win over this change.
  gain.cancelAndHoldAtTime(context.currentTime);
  gain.setTargetAtTime(level(volume), context.currentTime, 0.015);
  return true;
}

function stop(tabId) {
  const tab = tabs.get(tabId);
  if (!tab) return;
  tabs.delete(tabId);
  tab.stream.getTracks().forEach((track) => track.stop());
  tab.limiter.disconnect();
  // No tab captured any more (a tab at 100% still is, and needs the output running): let it rest.
  if (tabs.size === 0) context.suspend();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen") return;
  if (message.type === "set") {
    sendResponse({ found: set(message.tabId, message.volume) });
    return;
  }
  const jobs = {
    warm: () => output(),
    start: () => start(message.tabId, message.streamId, message.volume),
  };
  if (!jobs[message.type]) return;
  jobs[message.type]().then(
    () => sendResponse({}),
    (e) => sendResponse({ error: String(e) })
  );
  return true;
});
