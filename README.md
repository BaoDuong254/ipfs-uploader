# IPFS Uploader

A minimal Node.js + Express application that lets you **upload any file to IPFS and retrieve it later with its CID while preserving the original filename and MIME type**.

## Prerequisites

1. Node.js 18 or newer
2. IPFS daemon or gateway

   ```bash
   # Local daemon (recommended for development)
   ipfs init          # first time only
   ipfs daemon
   ```

## API Reference

### `POST /upload`

| Part     | Type   | Description                                       |
| -------- | ------ | ------------------------------------------------- |
| `file`   | `file` | Any file you want to pin to IPFS                  |
| Response | `JSON` | `{ "cid": "<CID string>", "name": "<filename>" }` |

### `GET /download/:cid`

Streams the file contained in the directory identified by `:cid`.

| Param | Type   | Description                              |
| ----- | ------ | ---------------------------------------- |
| `cid` | `path` | Parent CID returned earlier by `/upload` |

## How it works

1. The server **wraps every uploaded file in a one‑file directory**.
   This gives you two benefits:

   * You can always discover the **original filename** with a single `ipfs.ls` call.
   * The CID remains stable even if you decide to add more files to that directory later.
2. On download, the server:

   * Lists the directory to grab the inner file name.
   * Sets `Content-Type` via `mime-types` and `Content‑Disposition: attachment; filename="..."`.
   * Streams the file to the client using `ipfs.cat`.

Because of that workflow, users paste **exactly the CID they were given**, and the browser automatically saves **`document.pdf`** instead of an extension‑less blob.
