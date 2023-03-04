# Strona Organizacji Studenckich

Strona Tworzona na potrzeby Działu Studenckiego Politechniki Wrocławskiej.

Strona umożliwi wyświetlanie informacji o organizacjach studenckich i kołach naukowych.

Pozwoli na wyszukiwanie organizacji studenckich i koł naukowych po słowach kluczowych, dyscyplinach, programach, projektach.

## Development

### Zmienne środowiskowe

- `DATABASE_URL` - adres url do bazy danych
- `DATABASE_NAME` - nazwa bazy danych
- `DATABASE_USERNAME` - nazwa użytkownika bazy danych
- `DATABASE_PASSWORD` - hasło użytkownika bazy danych
- `GOOGLE_CLIENT_ID` - Google OAuth client id
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret token
- `NEXTAUTH_SECRET` - sekret do nextauth
- `NEXTAUTH_URL` - url do strony (domyślnie `http://localhost:3000`)

### Wymagania

- [node.js@16](https://nodejs.org/en/download/)
- [docker](https://docs.docker.com/get-docker/)

### Jak odpalić?

1. `npm install`
2. `npm run dev`

### Jak odpalić w trybie testowym?

1. `npm install`
2. `npm run dev:db` (W nowym terminalu)
3. `npm run db:seed`
4. `npm run dev`

Aby zmieniać dane w bazie danych, należy użyć Prisma studio:

- `npm run db:studio`
