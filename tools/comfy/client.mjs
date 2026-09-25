// Minimal ComfyUI HTTP client: queue a prompt, wait for it, download the images.
import { randomUUID } from "node:crypto";

export const createClient = ({ url, auth, fetchImpl = fetch, pollMs = 1500, timeoutMs = 10 * 60 * 1000, retries = 4, retryMs = 2000 }) => {
  const base = url.replace(/\/+$/, "");
  const headers = {
    // ngrok free domains show a browser warning page unless this header is set.
    "ngrok-skip-browser-warning": "1",
    ...(auth ? { Authorization: `Basic ${Buffer.from(auth).toString("base64")}` } : {}),
  };

  // ngrok answers 502-504 for a moment when the tunnel hiccups: retry those a few times.
  const request = async (path, init = {}, attempt = 0) => {
    const response = await fetchImpl(`${base}${path}`, { ...init, headers: { ...headers, ...init.headers } });
    if ([502, 503, 504].includes(response.status) && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, retryMs * 2 ** attempt));
      return request(path, init, attempt + 1);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`ComfyUI ${init.method ?? "GET"} ${path} -> ${response.status} ${body.slice(0, 500)}`);
    }
    return response;
  };

  const json = async (path, init) => (await request(path, init)).json();

  const queue = async (workflow) => {
    const { prompt_id: promptId, node_errors: nodeErrors } = await json("/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow, client_id: randomUUID() }),
    });
    if (nodeErrors && Object.keys(nodeErrors).length) {
      throw new Error(`ComfyUI rejected the workflow: ${JSON.stringify(nodeErrors)}`);
    }
    return promptId;
  };

  const wait = async (promptId) => {
    const started = Date.now();
    for (;;) {
      const history = await json(`/history/${promptId}`);
      const entry = history[promptId];
      if (entry?.status?.status_str === "error") {
        throw new Error(`ComfyUI failed: ${JSON.stringify(entry.status.messages ?? entry.status)}`);
      }
      if (entry?.outputs && Object.keys(entry.outputs).length) return entry.outputs;
      if (Date.now() - started > timeoutMs) throw new Error(`Timed out waiting for prompt ${promptId}`);
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  };

  const download = async ({ filename, subfolder, type }) => {
    const query = new URLSearchParams({ filename, subfolder: subfolder ?? "", type: type ?? "output" });
    return Buffer.from(await (await request(`/view?${query}`)).arrayBuffer());
  };

  // Runs a workflow and returns the first image it saved.
  const run = async (workflow) => {
    const outputs = await wait(await queue(workflow));
    const image = Object.values(outputs).flatMap((output) => output.images ?? [])[0];
    if (!image) throw new Error("The workflow finished without saving an image");
    return download(image);
  };

  // Uploads a PNG into ComfyUI's input folder so LoadImage / LoadImageMask can use it.
  const upload = async (buffer, name) => {
    const form = new FormData();
    form.append("image", new Blob([buffer], { type: "image/png" }), name);
    form.append("overwrite", "true");
    const { name: stored, subfolder } = await json("/upload/image", { method: "POST", body: form });
    return subfolder ? `${subfolder}/${stored}` : stored;
  };

  return {
    upload,
    systemStats: () => json("/system_stats"),
    checkpoints: async () => {
      const info = await json("/object_info/CheckpointLoaderSimple");
      return info.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] ?? [];
    },
    run,
  };
};
