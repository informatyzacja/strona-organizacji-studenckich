# how to create a new directus instance

1. Setup Directus CMS (lol)
2. Download organization data from <https://s3.reix.tech/sos_image_data.zip> and place it in scripts folder
3. Create two folders in directus, for photos and logos
4. Replace CONFIG values in `loadDataToDirectus.ts`
5. `npx tsx ./scripts/loadDataToDirectus.ts`
