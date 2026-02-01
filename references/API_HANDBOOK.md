# Grow Fin Server - API Handbook

Quick reference for all implemented APIs in the integrated platform.

**Base URL:** `http://localhost:8093`

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Company APIs](#company-apis)
4. [Fish Farming APIs](#fish-farming-apis)
5. [Media Service APIs](#media-service-apis)
6. [Common Response Formats](#common-response-formats)

---

## 🔐 Authentication APIs

**Base Path:** `/api/auth`

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "organization_name": "My Farm" (optional)
}

Response: 201 Created
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user_key": "123456789",
    "account_key": "987654321",
    "expires_in": 604800
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": { ... },
    "account": { ... }
  }
}
```

### Validate Token
```http
POST /api/auth/validate
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "valid": true,
    "payload": {
      "user_key": "123456789",
      "account_key": "987654321",
      "role": "owner"
    }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 604800
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Change Password
```http
POST /api/auth/password/change
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "oldpass123",
  "new_password": "newpass123"
}

Response: 200 OK
```

### Forgot Password
```http
POST /api/auth/password/forgot
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "If the email exists, a reset link will be sent"
}
```

### Reset Password
```http
POST /api/auth/password/reset
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newpass123"
}

Response: 200 OK
```

---

## 👤 User Management APIs

**Base Path:** `/api/user`

**All endpoints require authentication:** `Authorization: Bearer {token}`

### Get Current User
```http
GET /api/user/me

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "user_key": "123456789",
      "account_key": "987654321",
      "profile": { ... },
      "role": "owner"
    }
  }
}
```

### Update Current User
```http
PUT /api/user/me
Content-Type: application/json

{
  "profile": {
    "first_name": "John",
    "last_name": "Doe"
  },
  "settings": {
    "timezone": "Asia/Kolkata"
  }
}
```

### Get Current User Settings
```http
GET /api/user/settings

Response: 200 OK
{
  "success": true,
  "data": {
    "settings": {
      "timezone": "Asia/Kolkata",
      "locale": "en-IN",
      "theme": "light"
    }
  }
}
```

### Update Current User Settings
```http
PUT /api/user/settings
Content-Type: application/json

{
  "timezone": "America/New_York",
  "theme": "dark"
}
```

### Get Current User Profile
```http
GET /api/user/profile

Response: 200 OK
{
  "success": true,
  "data": {
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "avatar_url": "https://...",
      "bio": "Fish farming enthusiast"
    }
  }
}
```

### Update Current User Profile
```http
PUT /api/user/profile
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://..."
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Get Current User Auth Info
```http
GET /api/user/auth

Response: 200 OK
{
  "success": true,
  "data": {
    "auth": {
      "username": "johndoe",
      "email": "john@example.com",
      "mfa_enabled": false,
      "last_login": "2024-01-30T10:00:00Z"
    }
  }
}
```

### Update Auth Settings
```http
PUT /api/user/auth
Content-Type: application/json

{
  "username": "newusername",
  "mfa_enabled": true
}

Response: 200 OK
{
  "success": true,
  "message": "Auth settings updated successfully"
}
```

### Get Token Settings
```http
GET /api/user/auth/token-settings

Response: 200 OK
{
  "success": true,
  "data": {
    "token_settings": {
      "access_token_expire_days": 7,
      "refresh_token_expire_days": 30
    }
  }
}
```

### Update Token Settings
```http
PUT /api/user/auth/token-settings
Content-Type: application/json

{
  "access_token_expire_days": 14,
  "refresh_token_expire_days": 60
}

Response: 200 OK
{
  "success": true,
  "message": "Token settings updated successfully"
}
```

### Get Current User Permissions
```http
GET /api/user/permissions

Response: 200 OK
{
  "success": true,
  "data": {
    "permissions": {
      "can_manage_users": true,
      "can_manage_farms": true,
      "can_view_reports": true,
      "role": "owner"
    }
  }
}
```

### Update Current User Permissions
```http
PUT /api/user/permissions
Content-Type: application/json

{
  "can_manage_users": false,
  "can_view_reports": true
}

Response: 200 OK
{
  "success": true,
  "message": "Permissions updated successfully"
}
```

### Create New User (Admin)
```http
POST /api/user
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "manager"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user_key": "987654321",
    "email": "newuser@example.com",
    "invite_sent": true
  }
}
```

### Get Specific User (Admin)
```http
GET /api/user/{user_key}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "user_key": "987654321",
      "email": "user@example.com",
      "profile": {
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "role": "manager",
      "status": "active"
    }
  }
}
```

### Update Specific User (Admin)
```http
PUT /api/user/{user_key}
Content-Type: application/json

{
  "role": "manager"
}

Response: 200 OK
{
  "success": true,
  "message": "User updated successfully"
}
```

### Deactivate User (Admin)
```http
DELETE /api/user/{user_key}

Response: 200 OK
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### Get User Settings (Admin)
```http
GET /api/user/{user_key}/settings

Response: 200 OK
{
  "success": true,
  "data": {
    "settings": {
      "timezone": "Asia/Kolkata",
      "locale": "en-IN",
      "theme": "light"
    }
  }
}
```

### Update User Settings (Admin)
```http
PUT /api/user/{user_key}/settings
Content-Type: application/json

{
  "timezone": "America/New_York",
  "theme": "dark"
}

Response: 200 OK
{
  "success": true,
  "message": "User settings updated successfully"
}
```

### Get User Profile (Admin)
```http
GET /api/user/{user_key}/profile

Response: 200 OK
{
  "success": true,
  "data": {
    "profile": {
      "first_name": "Jane",
      "last_name": "Smith",
      "phone": "+1234567890",
      "avatar_url": "https://..."
    }
  }
}
```

### Update User Profile (Admin)
```http
PUT /api/user/{user_key}/profile
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890"
}

Response: 200 OK
{
  "success": true,
  "message": "User profile updated successfully"
}
```

### Get User Permissions (Admin)
```http
GET /api/user/{user_key}/permissions

Response: 200 OK
{
  "success": true,
  "data": {
    "permissions": {
      "can_manage_users": false,
      "can_manage_farms": true,
      "can_view_reports": true,
      "role": "manager"
    }
  }
}
```

### Update User Permissions (Admin)
```http
PUT /api/user/{user_key}/permissions
Content-Type: application/json

{
  "can_manage_users": true,
  "can_manage_farms": true
}

Response: 200 OK
{
  "success": true,
  "message": "User permissions updated successfully"
}
```

### List Users in Organization
```http
GET /api/users/list?role=manager&status=active&limit=50

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

---

## 🏢 Company APIs

**Base Path:** `/api/company`

**All endpoints require authentication**

### Get Company Profile
```http
GET /api/company/profile
```

### Update Company Profile
```http
PUT /api/company/profile
Content-Type: application/json

{
  "name": "Updated Farm Name",
  "address": "123 Farm Road"
}
```

---

## 🐟 Fish Farming APIs

**Base Path:** `/api/fish`

**All endpoints require authentication**

### Farms

#### List Farms
```http
GET /api/fish/farms

Response: 200 OK
{
  "success": true,
  "data": {
    "farms": [
      {
        "farm_id": "farm_123",
        "name": "Coastal Farm A",
        "location": "Lat: 12.34, Long: 56.78",
        "area_acres": 25.5
      }
    ]
  }
}
```

#### Create Farm
```http
POST /api/fish/farms
Content-Type: application/json

{
  "name": "New Farm",
  "location": "Lat: 12.34, Long: 56.78",
  "area_acres": 30.0,
  "water_source": "River"
}

Response: 201 Created
```

#### Get Farm
```http
GET /api/fish/farms/{farm_id}
```

#### Update Farm
```http
PUT /api/fish/farms/{farm_id}
Content-Type: application/json

{
  "name": "Updated Farm Name",
  "area_acres": 35.0
}
```

#### Delete Farm
```http
DELETE /api/fish/farms/{farm_id}
```

#### Get Farm Ponds
```http
GET /api/fish/farms/{farm_id}/ponds
```

### Ponds

#### List Ponds
```http
GET /api/fish/ponds?status=stocked

Response: 200 OK
{
  "success": true,
  "data": {
    "ponds": [
      {
        "pond_id": "pond_456",
        "name": "Pond 1",
        "farm_id": "farm_123",
        "size_sqm": 1000,
        "status": "stocked"
      }
    ]
  }
}
```

#### Create Pond
```http
POST /api/fish/ponds
Content-Type: application/json

{
  "farm_id": "farm_123",
  "name": "Pond 5",
  "size_sqm": 1500,
  "depth_m": 2.5
}
```

#### Get Pond
```http
GET /api/fish/ponds/{pond_id}
```

#### Update Pond
```http
PUT /api/fish/ponds/{pond_id}
Content-Type: application/json

{
  "status": "maintenance"
}
```

#### Delete Pond
```http
DELETE /api/fish/ponds/{pond_id}
```

#### Get Pond Water Quality
```http
GET /api/fish/ponds/{pond_id}/water-quality
```

#### Get Pond Stock
```http
GET /api/fish/ponds/{pond_id}/stock
```

### Species

#### List Species
```http
GET /api/fish/species?category=freshwater

Response: 200 OK
{
  "success": true,
  "data": {
    "species": [
      {
        "species_id": "sp_789",
        "name": "Tilapia",
        "scientific_name": "Oreochromis niloticus",
        "category": "freshwater"
      }
    ]
  }
}
```

#### Create Species
```http
POST /api/fish/species
Content-Type: application/json

{
  "name": "Catfish",
  "scientific_name": "Clarias gariepinus",
  "category": "freshwater"
}
```

#### Get Species
```http
GET /api/fish/species/{species_id}
```

#### Update Species
```http
PUT /api/fish/species/{species_id}
```

#### Delete Species
```http
DELETE /api/fish/species/{species_id}
```

### Stocks

#### List Stocks
```http
GET /api/fish/stocks?status=active

Response: 200 OK
{
  "success": true,
  "data": {
    "stocks": [
      {
        "stock_id": "stock_321",
        "pond_id": "pond_456",
        "species_id": "sp_789",
        "quantity": 5000,
        "status": "active"
      }
    ]
  }
}
```

#### Create Stock
```http
POST /api/fish/stocks
Content-Type: application/json

{
  "pond_id": "pond_456",
  "species_id": "sp_789",
  "quantity": 5000,
  "stocking_date": "2024-01-15",
  "avg_weight_g": 50
}
```

#### Get Stock
```http
GET /api/fish/stocks/{stock_id}
```

#### Update Stock
```http
PUT /api/fish/stocks/{stock_id}
```

#### Terminate Stock
```http
POST /api/fish/stocks/{stock_id}/terminate
Content-Type: application/json

{
  "termination_date": "2024-06-15",
  "reason": "Harvested"
}
```

#### Get Stock Summary
```http
GET /api/fish/stocks/{stock_id}/summary

Response: 200 OK
{
  "success": true,
  "data": {
    "summary": {
      "total_feedings": 120,
      "total_samplings": 10,
      "total_harvests": 2,
      "current_biomass_kg": 5000
    }
  }
}
```

### Feedings

#### List Feedings
```http
GET /api/fish/feedings?stock_id=stock_321&from_date=2024-01-01
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "feedings": [
      {
        "feeding_id": "feed_111",
        "stock_id": "stock_321",
        "pond_id": "pond_456",
        "feed_date": "2024-01-15",
        "feed_time": "08:00",
        "quantity_kg": 50,
        "feed_type": "Pellets"
      }
    ]
  }
}
```

#### Record Feeding
```http
POST /api/fish/feedings
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock_id": "stock_321",
  "pond_id": "pond_456",
  "feed_date": "2024-01-15",
  "feed_time": "08:00",
  "feed_type": "Pellets",
  "quantity_kg": 50,
  "cost_per_kg": 100
}

Response: 201 Created
{
  "success": true,
  "data": {
    "feeding_id": "feed_111",
    "stock_id": "stock_321",
    "feed_date": "2024-01-15"
  }
}
```

#### Get Feeding
```http
GET /api/fish/feedings/{feeding_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "feeding": {
      "feeding_id": "feed_111",
      "stock_id": "stock_321",
      "pond_id": "pond_456",
      "feed_date": "2024-01-15",
      "feed_time": "08:00",
      "feed_type": "Pellets",
      "quantity_kg": 50,
      "cost_per_kg": 100
    }
  }
}
```

#### Update Feeding
```http
PUT /api/fish/feedings/{feeding_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity_kg": 55,
  "cost_per_kg": 105
}

Response: 200 OK
{
  "success": true,
  "message": "Feeding record updated successfully"
}
```

#### Delete Feeding
```http
DELETE /api/fish/feedings/{feeding_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Feeding record deleted successfully"
}
```

### Samplings

#### List Samplings
```http
GET /api/fish/samplings?stock_id=stock_321
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "samplings": [
      {
        "sampling_id": "samp_222",
        "stock_id": "stock_321",
        "pond_id": "pond_456",
        "sample_date": "2024-02-01",
        "sample_size": 50,
        "avg_weight_g": 250
      }
    ]
  }
}
```

#### Record Sampling
```http
POST /api/fish/samplings
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock_id": "stock_321",
  "pond_id": "pond_456",
  "sample_date": "2024-02-01",
  "sample_size": 50,
  "avg_weight_g": 250,
  "min_weight_g": 200,
  "max_weight_g": 300
}

Response: 201 Created
{
  "success": true,
  "data": {
    "sampling_id": "samp_222",
    "stock_id": "stock_321",
    "sample_date": "2024-02-01"
  }
}
```

#### Get Sampling
```http
GET /api/fish/samplings/{sampling_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "sampling": {
      "sampling_id": "samp_222",
      "stock_id": "stock_321",
      "pond_id": "pond_456",
      "sample_date": "2024-02-01",
      "sample_size": 50,
      "avg_weight_g": 250,
      "min_weight_g": 200,
      "max_weight_g": 300
    }
  }
}
```

#### Update Sampling
```http
PUT /api/fish/samplings/{sampling_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "avg_weight_g": 255,
  "max_weight_g": 305
}

Response: 200 OK
{
  "success": true,
  "message": "Sampling record updated successfully"
}
```

#### Delete Sampling
```http
DELETE /api/fish/samplings/{sampling_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Sampling record deleted successfully"
}
```

### Harvests

#### List Harvests
```http
GET /api/fish/harvests?stock_id=stock_321
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "harvests": [
      {
        "harvest_id": "harv_333",
        "stock_id": "stock_321",
        "pond_id": "pond_456",
        "harvest_date": "2024-06-15",
        "quantity": 4500,
        "total_weight_kg": 1125
      }
    ]
  }
}
```

#### Record Harvest
```http
POST /api/fish/harvests
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock_id": "stock_321",
  "pond_id": "pond_456",
  "harvest_date": "2024-06-15",
  "quantity": 4500,
  "total_weight_kg": 1125,
  "avg_weight_g": 250,
  "price_per_kg": 200
}

Response: 201 Created
{
  "success": true,
  "data": {
    "harvest_id": "harv_333",
    "stock_id": "stock_321",
    "harvest_date": "2024-06-15",
    "total_revenue": 225000
  }
}
```

#### Get Harvest
```http
GET /api/fish/harvests/{harvest_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "harvest": {
      "harvest_id": "harv_333",
      "stock_id": "stock_321",
      "pond_id": "pond_456",
      "harvest_date": "2024-06-15",
      "quantity": 4500,
      "total_weight_kg": 1125,
      "avg_weight_g": 250,
      "price_per_kg": 200
    }
  }
}
```

#### Update Harvest
```http
PUT /api/fish/harvests/{harvest_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 4550,
  "total_weight_kg": 1137.5,
  "price_per_kg": 210
}

Response: 200 OK
{
  "success": true,
  "message": "Harvest record updated successfully"
}
```

#### Delete Harvest
```http
DELETE /api/fish/harvests/{harvest_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Harvest record deleted successfully"
}
```

### Mortalities

#### List Mortalities
```http
GET /api/fish/mortalities?stock_id=stock_321
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "mortalities": [
      {
        "mortality_id": "mort_444",
        "stock_id": "stock_321",
        "pond_id": "pond_456",
        "mortality_date": "2024-03-01",
        "quantity": 50,
        "cause": "Disease"
      }
    ]
  }
}
```

#### Record Mortality
```http
POST /api/fish/mortalities
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock_id": "stock_321",
  "pond_id": "pond_456",
  "mortality_date": "2024-03-01",
  "quantity": 50,
  "cause": "Disease",
  "notes": "Suspected bacterial infection"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "mortality_id": "mort_444",
    "stock_id": "stock_321",
    "mortality_date": "2024-03-01"
  }
}
```

#### Get Mortality
```http
GET /api/fish/mortalities/{mortality_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "mortality": {
      "mortality_id": "mort_444",
      "stock_id": "stock_321",
      "pond_id": "pond_456",
      "mortality_date": "2024-03-01",
      "quantity": 50,
      "cause": "Disease",
      "notes": "Suspected bacterial infection"
    }
  }
}
```

#### Update Mortality
```http
PUT /api/fish/mortalities/{mortality_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 55,
  "notes": "Confirmed bacterial infection - treated pond"
}

Response: 200 OK
{
  "success": true,
  "message": "Mortality record updated successfully"
}
```

#### Delete Mortality
```http
DELETE /api/fish/mortalities/{mortality_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Mortality record deleted successfully"
}
```

### Purchases

#### List Purchases
```http
GET /api/fish/purchases
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "purchases": [
      {
        "purchase_id": "purch_555",
        "purchase_date": "2024-01-10",
        "item_type": "feed",
        "item_name": "Fish Pellets",
        "quantity": 1000,
        "unit": "kg",
        "total_cost": 100000
      }
    ]
  }
}
```

#### Record Purchase
```http
POST /api/fish/purchases
Authorization: Bearer {token}
Content-Type: application/json

{
  "purchase_date": "2024-01-10",
  "item_type": "feed",
  "item_name": "Fish Pellets",
  "quantity": 1000,
  "unit": "kg",
  "price_per_unit": 100,
  "supplier": "ABC Feed Co."
}

Response: 201 Created
{
  "success": true,
  "data": {
    "purchase_id": "purch_555",
    "purchase_date": "2024-01-10",
    "total_cost": 100000
  }
}
```

#### Get Purchase
```http
GET /api/fish/purchases/{purchase_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "purchase": {
      "purchase_id": "purch_555",
      "purchase_date": "2024-01-10",
      "item_type": "feed",
      "item_name": "Fish Pellets",
      "quantity": 1000,
      "unit": "kg",
      "price_per_unit": 100,
      "total_cost": 100000,
      "supplier": "ABC Feed Co."
    }
  }
}
```

#### Update Purchase
```http
PUT /api/fish/purchases/{purchase_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 1100,
  "price_per_unit": 95
}

Response: 200 OK
{
  "success": true,
  "message": "Purchase record updated successfully"
}
```

#### Delete Purchase
```http
DELETE /api/fish/purchases/{purchase_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Purchase record deleted successfully"
}
```

### Transfers

#### List Transfers
```http
GET /api/fish/transfers?stock_id=stock_321
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "transfers": [
      {
        "transfer_id": "trans_666",
        "stock_id": "stock_321",
        "from_pond_id": "pond_456",
        "to_pond_id": "pond_789",
        "transfer_date": "2024-04-01",
        "quantity": 1000
      }
    ]
  }
}
```

#### Record Transfer
```http
POST /api/fish/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock_id": "stock_321",
  "from_pond_id": "pond_456",
  "to_pond_id": "pond_789",
  "transfer_date": "2024-04-01",
  "quantity": 1000,
  "reason": "Better water quality"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "transfer_id": "trans_666",
    "stock_id": "stock_321",
    "transfer_date": "2024-04-01"
  }
}
```

#### Get Transfer
```http
GET /api/fish/transfers/{transfer_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "transfer": {
      "transfer_id": "trans_666",
      "stock_id": "stock_321",
      "from_pond_id": "pond_456",
      "to_pond_id": "pond_789",
      "transfer_date": "2024-04-01",
      "quantity": 1000,
      "reason": "Better water quality"
    }
  }
}
```

#### Update Transfer
```http
PUT /api/fish/transfers/{transfer_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 1050,
  "reason": "Better water quality and pond spacing"
}

Response: 200 OK
{
  "success": true,
  "message": "Transfer record updated successfully"
}
```

#### Delete Transfer
```http
DELETE /api/fish/transfers/{transfer_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Transfer record deleted successfully"
}
```

### Maintenance

#### List Maintenance Records
```http
GET /api/fish/maintenance?pond_id=pond_456
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "maintenance": [
      {
        "maintenance_id": "maint_777",
        "pond_id": "pond_456",
        "maintenance_date": "2024-02-15",
        "maintenance_type": "cleaning",
        "description": "Pond bottom cleaning",
        "status": "completed"
      }
    ]
  }
}
```

#### Record Maintenance
```http
POST /api/fish/maintenance
Authorization: Bearer {token}
Content-Type: application/json

{
  "pond_id": "pond_456",
  "maintenance_date": "2024-02-15",
  "maintenance_type": "cleaning",
  "description": "Pond bottom cleaning",
  "cost": 5000
}

Response: 201 Created
{
  "success": true,
  "data": {
    "maintenance_id": "maint_777",
    "pond_id": "pond_456",
    "maintenance_date": "2024-02-15"
  }
}
```

#### Get Maintenance
```http
GET /api/fish/maintenance/{maintenance_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "maintenance": {
      "maintenance_id": "maint_777",
      "pond_id": "pond_456",
      "maintenance_date": "2024-02-15",
      "maintenance_type": "cleaning",
      "description": "Pond bottom cleaning",
      "cost": 5000,
      "status": "completed"
    }
  }
}
```

#### Update Maintenance
```http
PUT /api/fish/maintenance/{maintenance_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "cost": 5500
}

Response: 200 OK
{
  "success": true,
  "message": "Maintenance record updated successfully"
}
```

#### Delete Maintenance
```http
DELETE /api/fish/maintenance/{maintenance_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Maintenance record deleted successfully"
}
```

### Treatments

#### List Treatments
```http
GET /api/fish/treatments?stock_id=stock_321
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "treatments": [
      {
        "treatment_id": "treat_888",
        "stock_id": "stock_321",
        "pond_id": "pond_456",
        "treatment_date": "2024-03-05",
        "treatment_type": "antibiotic",
        "medication": "Oxytetracycline",
        "dosage": "50mg/kg",
        "withdrawal_days": 21
      }
    ]
  }
}
```

#### Record Treatment
```http
POST /api/fish/treatments
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock_id": "stock_321",
  "pond_id": "pond_456",
  "treatment_date": "2024-03-05",
  "treatment_type": "antibiotic",
  "medication": "Oxytetracycline",
  "dosage": "50mg/kg",
  "withdrawal_days": 21,
  "reason": "Bacterial infection"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "treatment_id": "treat_888",
    "stock_id": "stock_321",
    "treatment_date": "2024-03-05",
    "safe_harvest_date": "2024-03-26"
  }
}
```

#### Get Treatment
```http
GET /api/fish/treatments/{treatment_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "treatment": {
      "treatment_id": "treat_888",
      "stock_id": "stock_321",
      "pond_id": "pond_456",
      "treatment_date": "2024-03-05",
      "treatment_type": "antibiotic",
      "medication": "Oxytetracycline",
      "dosage": "50mg/kg",
      "withdrawal_days": 21,
      "reason": "Bacterial infection"
    }
  }
}
```

#### Update Treatment
```http
PUT /api/fish/treatments/{treatment_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "dosage": "60mg/kg",
  "notes": "Increased dosage after consultation"
}

Response: 200 OK
{
  "success": true,
  "message": "Treatment record updated successfully"
}
```

#### Delete Treatment
```http
DELETE /api/fish/treatments/{treatment_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Treatment record deleted successfully"
}
```

#### Check Withdrawal Status
```http
GET /api/fish/treatments/withdrawal-status/{stock_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "can_harvest": false,
    "withdrawal_end_date": "2024-03-26",
    "days_remaining": 5,
    "active_treatments": [
      {
        "treatment_id": "treat_888",
        "medication": "Oxytetracycline",
        "withdrawal_end_date": "2024-03-26"
      }
    ]
  }
}
```

### Activity Log

#### Get Activity
```http
GET /api/fish/activity?entity_type=stock&entity_id=stock_321&limit=50

Response: 200 OK
{
  "success": true,
  "data": {
    "activities": [
      {
        "activity_id": "act_999",
        "entity_type": "stock",
        "entity_id": "stock_321",
        "action": "created",
        "timestamp": "2024-01-15T10:00:00Z",
        "user_key": "123456789"
      }
    ]
  }
}
```

---

## 📢 Media Service APIs

**Base Path:** `/api`

**All endpoints require authentication**

### Alerts

#### List Alerts
```http
GET /api/alerts?status=unread&priority=high&limit=50

Response: 200 OK
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alert_id": "alert_111",
        "title": "Low Oxygen Level",
        "message": "Pond 1 oxygen level below threshold",
        "priority": "high",
        "status": "unread"
      }
    ]
  }
}
```

#### Create Alert
```http
POST /api/alerts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Water Quality Alert",
  "message": "pH level unusual in Pond 2",
  "priority": "medium",
  "category": "water_quality"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "alert_id": "alert_112",
    "title": "Water Quality Alert",
    "priority": "medium",
    "status": "unread"
  }
}
```

#### Get Alert
```http
GET /api/alerts/{alert_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "alert": {
      "alert_id": "alert_111",
      "title": "Low Oxygen Level",
      "message": "Pond 1 oxygen level below threshold",
      "priority": "high",
      "status": "unread",
      "category": "water_quality",
      "created_at": "2024-01-30T10:00:00Z"
    }
  }
}
```

#### Update Alert
```http
PUT /api/alerts/{alert_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "priority": "low",
  "message": "pH level normalized in Pond 2"
}

Response: 200 OK
{
  "success": true,
  "message": "Alert updated successfully"
}
```

#### Delete Alert
```http
DELETE /api/alerts/{alert_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

#### Acknowledge Alert
```http
PUT /api/alerts/{alert_id}/acknowledge
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Alert acknowledged successfully"
}
```

#### Resolve Alert
```http
PUT /api/alerts/{alert_id}/resolve
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Alert resolved successfully"
}
```

#### Get Alert Stats
```http
GET /api/alerts/stats

Response: 200 OK
{
  "success": true,
  "data": {
    "total": 150,
    "unread": 10,
    "high_priority": 5
  }
}
```

### Tasks

#### List Tasks
```http
GET /api/tasks?status=pending&assignee=me&limit=50

Response: 200 OK
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "task_222",
        "title": "Feed Pond 1",
        "description": "Morning feeding schedule",
        "status": "pending",
        "priority": "high",
        "due_date": "2024-01-16"
      }
    ]
  }
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Check Water Quality",
  "description": "Weekly water quality check for all ponds",
  "assignee": "user_key_here",
  "due_date": "2024-01-20",
  "priority": "medium"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "task_id": "task_223",
    "title": "Check Water Quality",
    "status": "pending",
    "assignee": "user_key_here"
  }
}
```

#### Get Task
```http
GET /api/tasks/{task_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "task": {
      "task_id": "task_222",
      "title": "Feed Pond 1",
      "description": "Morning feeding schedule",
      "status": "pending",
      "priority": "high",
      "due_date": "2024-01-16",
      "assignee": "user_key_123",
      "created_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

#### Update Task
```http
PUT /api/tasks/{task_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress"
}

Response: 200 OK
{
  "success": true,
  "message": "Task updated successfully"
}
```

#### Delete Task
```http
DELETE /api/tasks/{task_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Complete Task
```http
PUT /api/tasks/{task_id}/complete
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Task completed successfully"
}
```

#### Get My Pending Tasks
```http
GET /api/tasks/my/pending
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "task_222",
        "title": "Feed Pond 1",
        "description": "Morning feeding schedule",
        "status": "pending",
        "priority": "high",
        "due_date": "2024-01-16"
      }
    ]
  }
}
```

### Notifications

#### List Notifications
```http
GET /api/notifications?status=unread&limit=50
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notification_id": "notif_333",
        "title": "Task Assigned",
        "message": "You have been assigned a new task",
        "type": "task",
        "status": "unread",
        "created_at": "2024-01-30T10:00:00Z"
      }
    ]
  }
}
```

#### Create Notification
```http
POST /api/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "System Update",
  "message": "System maintenance scheduled for tonight",
  "type": "system",
  "priority": "medium"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "notification_id": "notif_334",
    "title": "System Update",
    "status": "unread"
  }
}
```

#### Get Notification
```http
GET /api/notifications/{notification_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "notification": {
      "notification_id": "notif_333",
      "title": "Task Assigned",
      "message": "You have been assigned a new task",
      "type": "task",
      "status": "unread",
      "created_at": "2024-01-30T10:00:00Z"
    }
  }
}
```

#### Update Notification
```http
PUT /api/notifications/{notification_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "read"
}

Response: 200 OK
{
  "success": true,
  "message": "Notification updated successfully"
}
```

#### Delete Notification
```http
DELETE /api/notifications/{notification_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/{notification_id}/read
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count

Response: 200 OK
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Chat

#### List Conversations
```http
GET /api/chat/conversations?limit=50
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "conv_444",
        "participants": ["user1", "user2"],
        "last_message": "Let's check Pond 3",
        "last_message_at": "2024-01-30T10:00:00Z",
        "unread_count": 2
      }
    ]
  }
}
```

#### Create Conversation
```http
POST /api/chat/conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "participants": ["user_key_123", "user_key_456"],
  "title": "Pond 3 Discussion"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "conversation_id": "conv_445",
    "participants": ["user_key_123", "user_key_456"],
    "title": "Pond 3 Discussion"
  }
}
```

#### Get Conversation
```http
GET /api/chat/conversations/{conversation_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "conversation": {
      "conversation_id": "conv_444",
      "participants": ["user_key_123", "user_key_456"],
      "title": "Farm Operations",
      "created_at": "2024-01-20T10:00:00Z",
      "last_message_at": "2024-01-30T10:00:00Z"
    }
  }
}
```

#### Update Conversation
```http
PUT /api/chat/conversations/{conversation_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Discussion Title"
}

Response: 200 OK
{
  "success": true,
  "message": "Conversation updated successfully"
}
```

#### Delete Conversation
```http
DELETE /api/chat/conversations/{conversation_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

#### Send Message
```http
POST /api/chat/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation_id": "conv_444",
  "message": "Water quality looks good today"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "message_id": "msg_556",
    "conversation_id": "conv_444",
    "message": "Water quality looks good today",
    "timestamp": "2024-01-30T10:00:00Z"
  }
}
```

#### Get Messages
```http
GET /api/chat/messages/{conversation_id}?limit=100
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "messages": [
      {
        "message_id": "msg_555",
        "conversation_id": "conv_444",
        "sender": "user_key_123",
        "message": "Hello",
        "timestamp": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Get Unread Count
```http
GET /api/chat/conversations/{conversation_id}/unread-count
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

## 📄 Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

---

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get the token from:
1. `/api/auth/register` - When registering a new account
2. `/api/auth/login` - When logging in
3. `/api/auth/refresh` - When refreshing an expired token

---

## 📊 Status Codes

- `200 OK` - Successful GET/PUT/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🧪 Testing with Swagger

Interactive API documentation and testing available at:

**Swagger UI:** `http://localhost:8093/swagger`

1. Click "Authorize" button
2. Enter: `Bearer YOUR_ACCESS_TOKEN`
3. Try out any endpoint!

---

## 📚 Additional Resources

- **OpenAPI Spec:** `http://localhost:8093/static/swagger/api-spec.yaml`
- **Postman Collection:** `http://localhost:8093/static/swagger/postman-collection.json`
- **Health Check:** `http://localhost:8093/health`

---

**Last Updated:** January 31, 2026
