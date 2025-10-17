// lib/emitter.ts
export async function emit(room: string, event: string, payload: any) {
  await fetch("http://localhost:3001/emit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, event, payload }),
  }).catch((e) => console.error("emit error", e));
}
