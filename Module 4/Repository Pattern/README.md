# Repository Pattern Assignment

Refactor this small community-platform API so services depend on a repository boundary instead of the in-memory store.

## Run

```bash
npm install
npm start
```

The API listens at `http://localhost:3000`. Available endpoints:

- `GET /posts` and `GET /posts/:id`
- `POST /posts` with a JSON body containing `title` (and optionally `body` and `authorId`)
- `PUT /posts/:id` or `PATCH /posts/:id`
- `DELETE /posts/:id`

The post service uses `src/repositories/postRepository.js` for all data access. The repository currently stores posts in a private `Map`; its five-method interface keeps storage details and ID generation out of the service.

To replace the in-memory implementation with Prisma, change the repository's storage operations while preserving its method names and return semantics. Keep routes, controllers, response shapes, and business behavior unchanged.
