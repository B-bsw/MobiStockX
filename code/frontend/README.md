This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Automatic production deployment

The GitHub Actions workflow at `.github/workflows/deploy-frontend.yml` deploys this
frontend to Vercel whenever frontend code is pushed to the `main` branch. It can
also be started manually from the repository's **Actions** tab.

Configure these GitHub repository secrets before running the workflow:

- `VERCEL_TOKEN`: Create a token in **Vercel > Account Settings > Tokens**.
- `VERCEL_ORG_ID`: The `orgId` value from `.vercel/project.json`.
- `VERCEL_PROJECT_ID`: The `projectId` value from `.vercel/project.json`.

To obtain the IDs, link the frontend locally and inspect the generated file:

```bash
cd code/frontend
npx vercel link
cat .vercel/project.json
```

The `.vercel` directory is ignored by Git and must not be committed. Add all
three values under **GitHub repository > Settings > Secrets and variables >
Actions**.
