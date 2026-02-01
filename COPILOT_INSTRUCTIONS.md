# Copilot Instructions for Task Circuit UI
**Last Updated:** February 1, 2026  
**Status:** ✅ Production Ready
---
## 🎯 Core Principles
### 1. **Use Centralized Components**
Always use the 29 reusable components from the component library. Never create custom implementations.
### 2. **Clean UI Components**
UI components should have **minimal logic**. Move business logic to models, services, and utilities.
### 3. **Models Handle Data**
Use model classes for data validation, transformation, and API payload generation.
### 4. **Services Handle API Calls**
Use service layers for all API operations. Never call APIs directly from UI components.
### 5. **Utils for Reusable Functions**
Place reusable helper functions in utilities, not in components.
---
## 📁 Folder Structure
Follow this exact structure for all new code:
```
src/
├── components/
│   ├── common/                    # ⭐ Reusable UI Components (DON'T MODIFY)
│   │   ├── forms/                 # Form components (9)
│   │   └── ...                    # UI components (7)
│   └── [feature]/                 # Feature-specific components
│       ├── forms/
│       └── [Feature]Card.js
│
├── models/                        # ⭐ Data Models
│   ├── Fish.js
│   ├── Pond.js
│   ├── Farm.js
│   └── index.js
│
├── services/                      # ⭐ API Services
│   ├── fishService.js
│   ├── pondService.js
│   └── index.js
│
├── utils/                         # ⭐ Utilities
│   ├── storage/
│   ├── validation/
│   └── helpers.js
│
├── pages/                         # Page Components
│   └── user/
│       ├── FishPage.js
│       └── PondPage.js
│
└── api/                           # API Configuration
    ├── client.js
    └── constants.js
```
---
## ✅ Component Usage Rules
### **ALWAYS Use These Components:**
**Form Components (9):**
```javascript
import {
  FormContainer,    // ← Wrapper for all forms
  FormSection,      // ← Section headers
  FormField,        // ← Text/number/date inputs
  FormDropdown,     // ← Dropdowns with refresh
  FormRadio,        // ← Radio buttons
  FormFileUpload,   // ← File uploads
  FormKeyValue,     // ← Dynamic key-value pairs
  FormRepeater,     // ← Repeatable sections (add/remove items)
  FormActions       // ← Submit/Cancel buttons
} from './components/common/forms';
```
**UI Components (7):**
```javascript
import {
  ActionButton,     // ← All buttons
  SearchInput,      // ← Search fields
  BaseCard,         // ← All cards
  StatusChip,       // ← Status badges
  PageHeader,       // ← Page headers
  DataGrid,         // ← Data lists/grids
  FilterBar         // ← Search/filter toolbar
} from './components/common';
```
**State Components:**
```javascript
import {
  LoadingState,     // ← Loading indicators
  EmptyState,       // ← No data states
  ErrorState,       // ← Error displays
  ConfirmDialog     // ← Confirmation dialogs
} from './components/common';
```
### **NEVER:**
- ❌ Create custom buttons (use `ActionButton`)
- ❌ Create custom cards (use `BaseCard`)
- ❌ Create custom form wrappers (use `FormContainer`)
- ❌ Create custom search inputs (use `SearchInput`)
- ❌ Create custom loading/empty/error states
---
## 🏗️ Clean Architecture Pattern
### **Page Component (Minimal Logic):**
```javascript
// ✅ GOOD - Clean page component
function FishPage() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    loadFish();
  }, []);
  // ✅ Call service, not API
  const loadFish = async () => {
    setLoading(true);
    setError(null);
    try {
      const fishList = await fetchFish(); // ← Service handles API
      setFish(fishList);                 // ← Already transformed by model
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  // ✅ Use service for create
  const handleAdd = async (formData) => {
    try {
      await createFish(formData);        // ← Service handles everything
      loadFish();                        // ← Refresh list
    } catch (err) {
      alert('Failed to add fish');
    }
  };
  // ✅ Use reusable components
  return (
    <>
      <PageHeader
        title="Fish Management"
        actions={
          <ActionButton icon={<AddIcon />} onClick={() => setShowForm(true)}>
            Add Fish
          </ActionButton>
        }
      />
      <DataGrid
        items={fish}
        loading={loading}
        error={error}
        renderItem={(fish) => <FishCard fish={fish} />}
      />
    </>
  );
}
```
### **❌ BAD Example - Everything in Component:**
```javascript
// ❌ BAD - Don't do this!
function FishPage() {
  const [fish, setFish] = useState([]);
  const loadFish = async () => {
    // ❌ API call in component
    const response = await fetch('/api/fish');
    const data = await response.json();
    // ❌ Data transformation in component
    const transformed = data.map(f => ({
      ...f,
      weight: parseFloat(f.weight)
    }));
    setFish(transformed);
  };
  // ❌ Business logic in component
  const handleSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      weight: parseFloat(formData.weight),
      // ... more transformations
    };
    // ❌ Direct API call
    await fetch('/api/fish', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  };
  // ❌ Custom components instead of reusable ones
  return (
    <div>
      <h1>Fish Management</h1>
      <button onClick={handleAdd}>Add</button>
      {fish.map(f => <div key={f.id}>{f.name}</div>)}
    </div>
  );
}
```
---
## 📦 Model Usage
### **Model Structure:**
```javascript
// src/models/Fish.js
export class Fish {
  constructor(data) {
    this._raw = data;
    this._errors = [];
    // Parse fields
    this.fish_id = data.fish_id || '';
    this.name = data.name || '';
    this.weight = parseFloat(data.weight) || 0;
  }
  // ✅ Validation
  isValid() {
    this._errors = [];
    if (!this.name) this._errors.push('Name required');
    if (this.weight <= 0) this._errors.push('Weight must be positive');
    return this._errors.length === 0;
  }
  // ✅ API Payload
  toAPIPayload() {
    return {
      fish_id: this.fish_id,
      name: this.name,
      weight: this.weight
    };
  }
  // ✅ Form Data
  toFormData() {
    return {
      name: this.name,
      weight: this.weight.toString()
    };
  }
  // ✅ Static Factories
  static fromFormData(formData) {
    return new Fish({
      name: formData.name,
      weight: parseFloat(formData.weight)
    });
  }
  static fromAPIResponse(apiData) {
    return new Fish(apiData);
  }
  // ✅ Default Data
  static getDefaultFormData() {
    return {
      name: '',
      weight: '',
      status: 'active'
    };
  }
}
```
### **Using Models:**
```javascript
// ✅ In Forms
const handleSubmit = () => {
  const fish = Fish.fromFormData(form);
  if (!fish.isValid()) {
    console.error('Errors:', fish.errors);
    return;
  }
  onSubmit(fish.toAPIPayload());
};
// ✅ In Services
export async function createFish(fishData) {
  const fish = Fish.fromFormData(fishData);
  if (!fish.isValid()) {
    throw new Error('Invalid fish data');
  }
  const response = await apiFetch(API_FISH.CREATE, {
    method: 'POST',
    body: JSON.stringify(fish.toAPIPayload())
  });
  return Fish.fromAPIResponse(response.data);
}
```
---
## 🔧 Service Usage
### **Service Structure:**
```javascript
// src/services/fishService.js
import { apiFetch } from '../api/client';
import { API_FISH } from '../api/constants';
import { Fish } from '../models';
import { storageManager } from '../utils/storage';
// ✅ Fetch with cache
export async function fetchFish(force = false) {
  // Check cache
  if (!force && !storageManager.isCacheStale('fish')) {
    const cached = storageManager.getCache('fish');
    if (cached) return cached.map(f => Fish.fromAPIResponse(f));
  }
  // Fetch from API
  try {
    const response = await apiFetch(API_FISH.LIST);
    const fishList = response.data.fish.map(f => Fish.fromAPIResponse(f));
    // Update cache
    storageManager.setCache('fish', fishList.map(f => f.toAPIPayload()));
    return fishList;
  } catch (error) {
    console.error('[Fish Service] Fetch error:', error);
    throw error;
  }
}
// ✅ Create
export async function createFish(fishData) {
  try {
    const fish = Fish.fromFormData(fishData);
    if (!fish.isValid()) {
      throw new Error('Invalid fish data');
    }
    const response = await apiFetch(API_FISH.CREATE, {
      method: 'POST',
      body: JSON.stringify(fish.toAPIPayload())
    });
    // Clear cache to force refresh
    storageManager.clearCache('fish');
    return Fish.fromAPIResponse(response.data.fish);
  } catch (error) {
    console.error('[Fish Service] Create error:', error);
    throw error;
  }
}
// ✅ Update
export async function updateFish(fishId, fishData) {
  try {
    const fish = Fish.fromFormData(fishData);
    fish.fish_id = fishId;
    if (!fish.isValid()) {
      throw new Error('Invalid fish data');
    }
    const response = await apiFetch(API_FISH.UPDATE.replace(':id', fishId), {
      method: 'PUT',
      body: JSON.stringify(fish.toAPIPayload())
    });
    storageManager.clearCache('fish');
    return Fish.fromAPIResponse(response.data.fish);
  } catch (error) {
    console.error('[Fish Service] Update error:', error);
    throw error;
  }
}
// ✅ Delete
export async function deleteFish(fishId) {
  try {
    await apiFetch(API_FISH.DELETE.replace(':id', fishId), {
      method: 'DELETE'
    });
    storageManager.clearCache('fish');
    return true;
  } catch (error) {
    console.error('[Fish Service] Delete error:', error);
    throw error;
  }
}
```
---
## 📋 Checklist for New Features
### **Before You Start:**
- [ ] Check if similar component/feature exists
- [ ] Review model structure for the entity
- [ ] Check service layer for the entity
- [ ] Review component library (COMPONENT_LIBRARY.md)
### **Creating a New Feature:**
- [ ] Create model class (if needed)
- [ ] Create service layer (if needed)
- [ ] Use reusable components (don't create custom)
- [ ] Keep UI components clean (no logic)
- [ ] Call services, not APIs directly
- [ ] Use models for validation
- [ ] Use models for transformation
- [ ] Integrate with storage (cache)
- [ ] Add loading/error/empty states
- [ ] Test in dark and light themes
- [ ] Test on mobile and desktop
- [ ] Add JSDoc comments
### **Form Creation:**
- [ ] Use `FormContainer` wrapper
- [ ] Use `FormSection` for groups
- [ ] Use `FormField`, `FormDropdown`, etc.
- [ ] Use `FormActions` at the end
- [ ] Validate using model's `isValid()`
- [ ] Use model's `toAPIPayload()` for submission
### **Page Creation:**
- [ ] Use `PageHeader` component
- [ ] Use `FilterBar` if filtering needed
- [ ] Use `DataGrid` for lists
- [ ] Use `LoadingState`, `EmptyState`, `ErrorState`
- [ ] Call services for data
- [ ] Keep logic minimal
---
## 🚀 Quick Start Template
```javascript
// New Feature Page Template
import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import {
  PageHeader,
  ActionButton,
  FilterBar,
  DataGrid,
  BaseCard,
  LoadingState,
  EmptyState,
  ErrorState
} from '../components/common';
import {
  FormContainer,
  FormSection,
  FormField,
  FormActions
} from '../components/common/forms';
import { MyEntity } from '../models';
import { fetchMyEntities, createMyEntity } from '../services/myEntityService';
function MyFeaturePage() {
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyEntities();
      setItems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  // Create
  const handleCreate = async (formData) => {
    try {
      await createMyEntity(formData);
      setShowForm(false);
      loadData();
    } catch (err) {
      alert('Failed to create');
    }
  };
  // Render
  return (
    <>
      <PageHeader
        title="My Feature"
        subtitle="Manage items"
        actions={
          <ActionButton icon={<AddIcon />} onClick={() => setShowForm(true)}>
            Add New
          </ActionButton>
        }
      />
      <FilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        onRefresh={loadData}
        loading={loading}
      />
      <DataGrid
        items={items}
        loading={loading}
        error={error}
        renderItem={(item) => (
          <BaseCard title={item.name}>
            {item.description}
          </BaseCard>
        )}
        emptyActionLabel="Add Item"
        onEmptyAction={() => setShowForm(true)}
      />
      {/* Form Dialog */}
      {showForm && (
        <MyFeatureForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
}
// Form Component
function MyFeatureForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(MyEntity.getDefaultFormData());
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSubmit = () => {
    const entity = MyEntity.fromFormData(form);
    if (!entity.isValid()) {
      alert('Invalid data');
      return;
    }
    onSubmit(entity.toAPIPayload());
  };
  return (
    <FormContainer title="Add Item" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <FormSection title="Basic Info">
          <FormField
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            xs={12}
          />
        </FormSection>
        <FormActions
          submitText="Create"
          onCancel={onCancel}
        />
      </Grid>
    </FormContainer>
  );
}
```
---
## 📖 Documentation
| Document | Purpose |
|----------|---------|
| **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** | Complete component usage guide (ALL 29 components) |
| **[FORM_COMPONENTS_GUIDE.md](./FORM_COMPONENTS_GUIDE.md)** | Form components detailed guide |
| **[UI_COMPONENTS_GUIDE.md](./UI_COMPONENTS_GUIDE.md)** | UI components detailed guide |
| **[STORAGE_FORM_GUIDE.md](./STORAGE_FORM_GUIDE.md)** | Storage & form management |
| **[API_HANDBOOK.md](./references/API_HANDBOOK.md)** | Backend API reference |
---
## ✅ Summary
**ALWAYS:**
- ✅ Use the 29 reusable components
- ✅ Keep UI components clean (no logic)
- ✅ Use models for data handling
- ✅ Use services for API calls
- ✅ Use utils for helpers
- ✅ Theme-aware (use theme tokens)
- ✅ Responsive (use grid sizing)
**NEVER:**
- ❌ Create custom buttons/cards/forms
- ❌ Call APIs from UI components
- ❌ Transform data in UI components
- ❌ Validate in UI components
- ❌ Hardcode colors (use theme)
- ❌ Duplicate code
---
**Status:** ✅ Production Ready  
**Components:** 29 Reusable Components  
**Architecture:** Clean, Centralized, Scalable
**Follow these guidelines for consistent, maintainable code!** 🚀
