export const science = (metadata) => {
  fetch("https://obs.f-ck.me/ingest", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "p": "proxy.cubari.moe",
      "m": metadata,
    })
  })
};