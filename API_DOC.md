# TaskCircuit API Documentation

## Authentication
- Login: POST /auth/login
- Validate token: POST /auth/validate (Authorization: Bearer <access_token>)
- Refresh token: POST /auth/token (type: refresh_token, token: <refresh_token>)

## Fish Endpoints
- Add fish: POST /fish
  - Body: all biological, catch, and custom fields
- Get fish: GET /fish/:id
- List fish: GET /fish
- Update fish: PUT /fish/:id
- Delete fish: DELETE /fish/:id

## Example Requests
### Add Fish
```
curl --location 'http://localhost:8001/fish' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <access_token>' \
  --data '{
    "common_name": "Tilapia",
    "scientific_name": "Oreochromis niloticus",
    ...other fields...
  }'
```

### Get Fish
```
curl --location 'http://localhost:8001/fish/123' \
  --header 'Authorization: Bearer <access_token>'
```

### List Fish
```
curl --location 'http://localhost:8001/fish' \
  --header 'Authorization: Bearer <access_token>'
```

### Update Fish
```
curl --location --request PUT 'http://localhost:8001/fish/123' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <access_token>' \
  --data '{ ...fields... }'
```

### Delete Fish
```
curl --location --request DELETE 'http://localhost:8001/fish/123' \
  --header 'Authorization: Bearer <access_token>'
```

## Conventions
- Always use access_token for authentication
- Endpoints and baseUrl from config files
- All requests and responses are JSON
- See COPILOT_INSTRUCTIONS.md for UI/UX and design conventions

