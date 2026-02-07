

# Add Omada Controller Secrets

## Overview

Add the three required secrets so the Omada proxy edge function can authenticate with your Omada controller.

## Secrets to Add

| Secret | Value |
|---|---|
| `OMADA_URL` | `https://128.140.99.247:8043` |
| `OMADA_CLIENT_ID` | `2a933768997b44c1a473630d3195565c` |
| `OMADA_CLIENT_SECRET` | `daa36eba01674f5b8c3a14c4c5e31a92` |

## Steps

1. Add each secret to the project's backend configuration
2. Test the Omada proxy edge function to verify connectivity
3. No code changes are needed -- the edge function and dashboard already handle everything once secrets are present

## Potential Issue

The Omada URL uses a self-signed certificate (`https://128.140.99.247:8043`). If the edge function's `fetch` call rejects the certificate, we may need to update the edge function to handle this (Deno does not trust self-signed certs by default). We will test first and fix if needed.

