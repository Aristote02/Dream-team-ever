# M-Pesa (Vodacom DRC) — Dream Team Ever

Single reference for what is implemented, how to test locally (including ngrok), Render configuration, and go-live steps.

**Portal:** [openapiportal.m-pesa.com](https://openapiportal.m-pesa.com)  
**Market:** `vodacomDRC` · **Currency:** `USD` · **Country:** `DRC`

---

## What we built

End-to-end **sandbox** flow for registration ($10) and scolar ($50) fees:

1. Member checks out with **M-Pesa** → `POST /api/payments/initiate`
2. API creates a pending `PaymentTransaction`, calls M-Pesa **getSession** then **C2B single stage**
3. Customer approves USSD (sandbox test MSISDN)
4. M-Pesa **POST**s async result to `POST /api/webhooks/mpesa`
5. API completes payment (matricule / enrollment emails) — same path as dev simulation confirm

### Backend

| Area | Location |
|------|----------|
| Options | `DreamTeamEver.Application/Configuration/MpesaOptions.cs` |
| Payment orchestration | `DreamTeamEver.Application/Services/PaymentService.cs` |
| C2B payload (no Mapster for critical fields) | `DreamTeamEver.Application/Services/MpesaC2BRequestFactory.cs`, `MpesaPaymentReferenceBuilder.cs` |
| Gateway port | `DreamTeamEver.Application/Abstractions/Payments/IMpesaPaymentGateway.cs` |
| HTTP + RSA + session cache + Polly | `DreamTeamEver.Infrastructure/Payments/Mpesa/` |
| Webhook | `DreamTeamEver.Api/Features/Webhooks/Mpesa/MpesaWebhookEndpoint.cs` |
| Route | `/api/webhooks/mpesa` (`MpesaWebhookRoutes.Callback`) — **anonymous** |

### Frontend

| Area | Location |
|------|----------|
| Checkout + poll | `DreamTeamEver.Web/src/pages/CheckoutPage.tsx` |
| API | `DreamTeamEver.Web/src/api/paymentApi.ts` |
| Config flag | `GET /api/config/registration` → `mpesaEnabled`, `allowPaymentSimulation` |

### C2B request body (important)

M-Pesa validates reference lengths strictly. The app sends:

| JSON field | Source | Example |
|------------|--------|---------|
| `input_TransactionReference` | Short ref (~7 chars), e.g. `T` + 6 hex from payment id | `TFA520E` |
| `input_ThirdPartyReference` | Numeric 1–20 chars | `5895881` |
| `input_ThirdPartyConversationID` | Payment id, `Guid` format `N` (32 hex) | `fa520e40b1d44a4684671ce0d9604d5c` |
| `input_CustomerMSISDN` | Member phone, 12–14 digits | `000000000001` (sandbox) |
| `input_ServiceProviderCode` | Config | `000000` until Vodacom short code |
| `input_Amount` | Fee | `10.00` / `50.00` |
| `input_Country` / `input_Currency` | Config | `DRC` / `USD` |

Sending a 32-character GUID as `input_TransactionReference` causes **INS-17**.  
Omitting `input_ThirdPartyReference` also caused **INS-17** in our tests.

### Configuration

- **Secrets:** never commit API keys or public keys. Use **user secrets** (local) or **Render env vars** (deployed).
- `appsettings.json` only has empty placeholders under `Mpesa`.
- **Sandbox:** `UseSandbox: true` → encrypt with **`SandboxPublicKey`** + sandbox **API key** (SANDBOX tab on portal).
- **Production:** `UseSandbox: false` → **`OpenApiPublicKey`** + production API key (OPENAPI tab). Not required while sandbox is on.

```text
ActivePublicKey = UseSandbox ? SandboxPublicKey : OpenApiPublicKey
```

### Payment simulation

- `DreamTeamEver:AllowPaymentSimulation` — off in production (`false` on Render).
- In **Development**, simulation is also allowed via `IWebHostEnvironment.IsDevelopment()` even if the flag is false.
- When `mpesaEnabled` is true and simulation is off, checkout shows M-Pesa wait + polling (no fake confirm button).

---

## Prerequisites (developers)

1. **Open API portal** app (e.g. Dream Team Ever) with **C2B Single Payment**, **Asynchronous flow** enabled.
2. **Sandbox API key** + **SANDBOX** platform public key (paired).
3. Local stack: Postgres + API (+ frontend via Aspire or `npm run dev`).
4. Migrations applied (`DreamTeamEver.MigrationService` or Aspire migrator).

---

## Local configuration (user secrets)

From `DreamTeamEver.Api` project folder:

```powershell
cd src\backend\Services\DreamTeamEver\DreamTeamEver.Api

dotnet user-secrets set "Mpesa:Enabled" "true"
dotnet user-secrets set "Mpesa:UseSandbox" "true"
dotnet user-secrets set "Mpesa:ApiKey" "<sandbox-api-key-from-portal>"
dotnet user-secrets set "Mpesa:SandboxPublicKey" "<SANDBOX-public-key-pem-or-base64>"
```

Optional overrides (defaults exist in `MpesaDefaults`):

```powershell
dotnet user-secrets set "Mpesa:ServiceProviderCode" "000000"
dotnet user-secrets set "Mpesa:Market" "vodacomDRC"
dotnet user-secrets set "Mpesa:Country" "DRC"
dotnet user-secrets set "Mpesa:Currency" "USD"
dotnet user-secrets set "Mpesa:Origin" "*"
dotnet user-secrets set "Mpesa:BaseAddress" "https://openapi.m-pesa.com"
```

`appsettings.Development.json` sets `Mpesa:Enabled: true` and `AllowPaymentSimulation: true`.

---

## Test locally with ngrok (async webhook)

M-Pesa cannot call `localhost`. Use ngrok so the portal **Response URL** reaches your machine.

### 1. Run API (note the HTTP port)

- **Aspire:** dashboard shows API URL (e.g. `http://localhost:5262` or another port each run).
- **dotnet run** on `DreamTeamEver.Api`: see log `Now listening on: http://localhost:XXXX`.

### 2. Start ngrok on that port

```powershell
ngrok http <API_HTTP_PORT>
```

Example: `ngrok http 5262`

Copy the **https** forwarding URL, e.g. `https://abc123.ngrok-free.app`.

### 3. Portal — Response URL (temporary for local test)

**C2B Single Payment** → **Asynchronous flow** → **Response URL:**

```text
https://<your-ngrok-subdomain>.ngrok-free.app/api/webhooks/mpesa
```

Save. **Trusted Sources:** `*` (or your frontend origin).

When you finish local testing, set Response URL back to Render (see below).

### 4. Run frontend

- Aspire: open web app URL from dashboard, or  
- `DreamTeamEver.Web`: set `.env` if needed:

```env
VITE_API_URL=http://localhost:<API_HTTP_PORT>
```

(Vite proxy in `vite.config.ts` targets `5262` when `VITE_API_URL` is unset — align port with your API.)

### 5. Test account

Register / profile phone: **`000000000001`** (12 digits, sandbox-friendly).

Checkout → **M-Pesa** → **Initiate payment** → complete sandbox USSD if prompted.

### 6. Verify

| Check | Expected |
|-------|----------|
| API logs | `getSession` → 200; C2B → **201** / INS-0; log line with `input_ThirdPartyReference`, short `input_TransactionReference` |
| ngrok UI | `http://127.0.0.1:4040` → `POST /api/webhooks/mpesa` |
| App | Payment success, matricule / emails |
| Portal Reports | Sandbox transaction row |

### 7. Optional: simulation without M-Pesa

In Development, **Simulate successful payment** still works for UI/DB tests without Vodacom.

---

## Render / deployed sandbox test

### API environment variables

Use double underscore for nested config:

| Variable | Sandbox value |
|----------|----------------|
| `DreamTeamEver__AllowPaymentSimulation` | `false` |
| `Mpesa__Enabled` | `true` |
| `Mpesa__UseSandbox` | `true` |
| `Mpesa__ApiKey` | Sandbox API key (secret) |
| `Mpesa__SandboxPublicKey` | SANDBOX public key (secret) |
| `Mpesa__ServiceProviderCode` | `000000` |
| `Mpesa__Market` | `vodacomDRC` |
| `Mpesa__Country` | `DRC` |
| `Mpesa__Currency` | `USD` |
| `Mpesa__Origin` | `*` |
| `Mpesa__BaseAddress` | `https://openapi.m-pesa.com` |

**Not needed while `Mpesa__UseSandbox` is `true`:** `Mpesa__OpenApiPublicKey`.

Also set DB, JWT, email (`Email__FrontendBaseUrl`, SendGrid, etc.) as for any API deploy.

### Portal Response URL (Render)

```text
https://dream-team-ever-api.onrender.com/api/webhooks/mpesa
```

(Use your real Render API hostname if different.)

Redeploy API after env changes. Run one checkout on the **production/staging frontend** pointing at Render API.

---

## Go-live checklist (not done yet)

| # | Task | Owner / notes |
|---|------|----------------|
| 1 | **Organisation short code** from Vodacom (`supportmpesa@m-pesa.cd` / portal onboarding) | Replace `000000` in portal + `Mpesa__ServiceProviderCode` |
| 2 | **Render sandbox smoke test** | Response URL on Render; one full payment |
| 3 | **Portal Reports** | Sandbox transaction visible (often required before review) |
| 4 | **Production credentials** | Production API key + **OPENAPI** public key on portal |
| 5 | **Render production env** | `Mpesa__UseSandbox=false`, `Mpesa__OpenApiPublicKey`, production `Mpesa__ApiKey`, real short code |
| 6 | **Portal** | Complete KYC / org linking → **SEND FOR REVIEW** → **Go Live** when approved |
| 7 | **Disable simulation** | `DreamTeamEver__AllowPaymentSimulation=false` on prod (already on Render) |
| 8 | **Real MSISDNs** | Stop relying on `000000000001` where portal requires live test numbers |
| 9 | **Orange Money** | Still “coming soon” in UI — out of scope for this integration |

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Session **401** | Wrong API key / public key pair (use SANDBOX key + SANDBOX public key) |
| C2B **INS-17** | Bad `input_TransactionReference` (too long) or missing `input_ThirdPartyReference` — see factory/builder above |
| C2B **INS-10** | Duplicate `input_ThirdPartyConversationID` — new payment row per attempt |
| C2B **INS-15** | Invalid amount format — must be string like `10.00` |
| Pending forever (local) | Response URL still points to Render/ngrok off/wrong port |
| Pending forever (Render) | Webhook URL wrong, API sleeping, or callback blocked |
| `mpesaEnabled: false` | `Mpesa:Enabled` false or secrets not loaded |

API logs include a serialized C2B JSON line before POST (search for `M-Pesa C2B payload`).

---

## Key API endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/config/registration` | Anonymous |
| POST | `/api/payments/initiate` | Bearer |
| GET | `/api/payments/{id}` | Bearer |
| POST | `/api/payments/{id}/confirm` | Bearer (simulation / dev only) |
| POST | `/api/webhooks/mpesa` | Anonymous (M-Pesa server) |

---

## Status

| Environment | Status |
|-------------|--------|
| Local + ngrok + sandbox | Verified (C2B 201, webhook, success UI, email) |
| Render + sandbox | Pending team verification after deploy |
| Production / go-live | Blocked on organisation short code + Vodacom approval |

*Last updated: May 2026 — reflects implemented codebase, not a pre-integration plan.*
