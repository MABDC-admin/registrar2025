

# Update Canva Client Secret

## Current Status

Your new Canva Client Secret is ready to be updated:
```
cnvcaDJ_M27xpzBRarraXtiv2gsu75IYzNb1bvi8KlGpk71oeabef108
```

## What I'll Do

1. **Update the `CANVA_CLIENT_SECRET`** environment variable with your new secret value
2. **Redeploy the `canva-auth` edge function** to pick up the new secret
3. **Test the Canva connection** to verify everything works

## After Implementation

Once the secret is updated, try connecting to Canva again. The OAuth flow should now complete successfully since:
- Client ID matches: `OC-AZwvbDGuqTz3`
- Client Secret will be updated to match your new secret
- Scopes are configured: `design:content:read design:meta:read profile:read`
- Redirect URL is set: `https://registrar2025.lovable.app`

