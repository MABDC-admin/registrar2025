

# Update Omada URL

## What Changes

Update the `OMADA_URL` secret from `https://128.140.99.247:8043` to `https://wifi.mabdc.com`. This domain likely has a valid TLS certificate, which should resolve the self-signed certificate issues encountered with the raw IP address.

## Steps

1. Update the `OMADA_URL` secret to `https://wifi.mabdc.com`
2. Test the connection by invoking the `omada-proxy` edge function's `status` action
3. Check logs to confirm successful authentication

## No Code Changes Required

The edge function already handles URL trailing-slash stripping and has the TLS fallback logic in place. Only the secret value needs updating.

