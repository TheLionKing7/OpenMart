# OpenMarket Logistics App

Licensed carrier partner app — view and advance logistics jobs created when merchants request partner delivery.

## Run

```bash
cd logistics-app
npm install
npm run web
```

Set `EXPO_PUBLIC_PLATFORM_URL` if the API is not on `http://localhost:3099`.

## Flow

1. Complete partner onboarding → registers on `POST /logistics/partners`
2. When a merchant checks out with logistics (or distributor offers delivery), backend creates a job on payment
3. Dashboard lists jobs from `GET /logistics/partners/:id/dashboard`
4. Advance job status → `PATCH /logistics/jobs/:id`
