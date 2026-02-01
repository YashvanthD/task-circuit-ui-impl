# AI Database Schema (ai_db)

Database for storing AI/ML usage, predictions, feedback, and learning context.

---

## Purpose

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI DATABASE PURPOSE                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. TRACK USAGE                                                                     │
│     • Every AI call logged                                                          │
│     • Token usage, costs, latency                                                   │
│     • Model versions, parameters                                                    │
│                                                                                      │
│  2. STORE PREDICTIONS                                                               │
│     • What was predicted                                                            │
│     • Confidence scores                                                             │
│     • Input context used                                                            │
│                                                                                      │
│  3. CAPTURE OUTCOMES                                                                │
│     • Was prediction correct?                                                       │
│     • User feedback (accept/reject/modify)                                          │
│     • Actual vs predicted values                                                    │
│                                                                                      │
│  4. ENABLE LEARNING                                                                 │
│     • Successful patterns                                                           │
│     • Error analysis                                                                │
│     • Context for similar future queries                                            │
│     • Self-improvement recommendations                                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ai_db ERD                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                         ┌─────────────────┐                                         │
│                         │   AI_MODELS     │                                         │
│                         │  (Model Config) │                                         │
│                         └────────┬────────┘                                         │
│                                  │                                                   │
│                                  │ used_by                                           │
│                                  ▼                                                   │
│                         ┌─────────────────┐                                         │
│                         │  AI_REQUESTS    │                                         │
│                         │  (Every call)   │                                         │
│                         └────────┬────────┘                                         │
│                                  │                                                   │
│            ┌─────────────────────┼─────────────────────┐                           │
│            │                     │                     │                           │
│            ▼                     ▼                     ▼                           │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                 │
│   │ AI_PREDICTIONS  │   │  AI_FEEDBACK    │   │ AI_CONVERSATIONS│                 │
│   │ (What AI said)  │   │ (User response) │   │ (Chat context)  │                 │
│   └────────┬────────┘   └────────┬────────┘   └─────────────────┘                 │
│            │                     │                                                  │
│            │                     │                                                  │
│            ▼                     ▼                                                  │
│   ┌─────────────────┐   ┌─────────────────┐                                        │
│   │  AI_OUTCOMES    │   │ AI_LEARNING     │                                        │
│   │ (Actual result) │   │ (Patterns)      │                                        │
│   └─────────────────┘   └─────────────────┘                                        │
│                                                                                      │
│                         ┌─────────────────┐                                         │
│                         │ AI_EMBEDDINGS   │                                         │
│                         │ (Vector store)  │                                         │
│                         └─────────────────┘                                         │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Collection: ai_models

AI model configurations and capabilities.

```json
{
  "_id": "ObjectId",
  "model_id": "string (12-digit) - PRIMARY KEY",
  
  "provider": "enum: openai | anthropic | google | local | custom",
  "model_name": "string (e.g., 'gpt-4', 'claude-3')",
  "model_version": "string",
  
  "capabilities": {
    "text_generation": "boolean",
    "image_analysis": "boolean",
    "embeddings": "boolean",
    "function_calling": "boolean",
    "vision": "boolean"
  },
  
  "config": {
    "max_tokens": "number",
    "temperature": "number",
    "top_p": "number",
    "context_window": "number"
  },
  
  "cost": {
    "input_per_1k_tokens": "number",
    "output_per_1k_tokens": "number",
    "currency": "string"
  },
  
  "use_cases": ["string (prediction types this model handles)"],
  
  "is_active": "boolean",
  "is_default": "boolean",
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ model_id: 1 }` - Unique
- `{ provider: 1, is_active: 1 }` - Active models by provider

---

## Collection: ai_requests

Every AI API call logged for tracking and analysis.

```json
{
  "_id": "ObjectId",
  "request_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "model_id": "string",
  "model_name": "string (denormalized)",
  
  "request_type": "enum: prediction | chat | embedding | analysis | recommendation",
  "feature": "string (e.g., 'water_quality_prediction', 'feed_optimization')",
  
  "input": {
    "prompt": "string (or truncated for storage)",
    "prompt_hash": "string (for deduplication)",
    "parameters": "object",
    "context_size": "number (tokens)"
  },
  
  "output": {
    "response": "string (or truncated)",
    "response_hash": "string",
    "tokens_used": "number"
  },
  
  "usage": {
    "input_tokens": "number",
    "output_tokens": "number",
    "total_tokens": "number",
    "estimated_cost": "number"
  },
  
  "performance": {
    "latency_ms": "number",
    "queue_time_ms": "number",
    "processing_time_ms": "number"
  },
  
  "context": {
    "entity_type": "string | null (pond, stock, farm)",
    "entity_id": "string | null",
    "user_key": "string",
    "session_id": "string | null",
    "conversation_id": "string | null"
  },
  
  "status": "enum: success | error | timeout | rate_limited",
  "error_message": "string | null",
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ request_id: 1 }` - Unique
- `{ account_key: 1, created_at: -1 }` - Usage history
- `{ account_key: 1, feature: 1, created_at: -1 }` - Feature usage
- `{ "input.prompt_hash": 1 }` - Cache lookup
- `{ model_id: 1, created_at: -1 }` - Model usage stats

---

## Collection: ai_predictions

Predictions made by AI with full context for learning.

```json
{
  "_id": "ObjectId",
  "prediction_id": "string (12-digit) - PRIMARY KEY",
  "request_id": "string - REQUIRED (links to ai_requests)",
  "account_key": "string - REQUIRED",
  
  "prediction_type": "enum: water_quality | growth | mortality | harvest | disease | feed | price | anomaly",
  
  "target": {
    "entity_type": "string (pond, stock, farm)",
    "entity_id": "string",
    "entity_name": "string",
    "parameter": "string (e.g., 'dissolved_oxygen', 'avg_weight')"
  },
  
  "prediction": {
    "value": "number | string | object",
    "unit": "string | null",
    "confidence": "number (0-1)",
    "confidence_interval": {
      "lower": "number",
      "upper": "number"
    }
  },
  
  "prediction_horizon": {
    "type": "enum: immediate | hours | days | weeks",
    "value": "number",
    "target_date": "datetime"
  },
  
  "input_context": {
    "historical_data_points": "number",
    "time_range_days": "number",
    "features_used": ["string"],
    "data_snapshot": "object (key metrics at prediction time)"
  },
  
  "reasoning": {
    "explanation": "string (AI's reasoning)",
    "factors": [
      {
        "factor": "string",
        "impact": "enum: positive | negative | neutral",
        "weight": "number"
      }
    ],
    "similar_cases_referenced": "number"
  },
  
  "recommendations": [
    {
      "action": "string",
      "priority": "enum: critical | high | medium | low",
      "expected_impact": "string"
    }
  ],
  
  "status": "enum: pending | validated | invalidated | expired",
  
  "created_at": "datetime",
  "expires_at": "datetime"
}
```

**Indexes:**
- `{ prediction_id: 1 }` - Unique
- `{ account_key: 1, prediction_type: 1, created_at: -1 }` - By type
- `{ "target.entity_id": 1, prediction_type: 1 }` - Entity predictions
- `{ status: 1, expires_at: 1 }` - Pending validations

---

## Collection: ai_outcomes

Actual outcomes to compare against predictions (ground truth).

```json
{
  "_id": "ObjectId",
  "outcome_id": "string (12-digit) - PRIMARY KEY",
  "prediction_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "actual": {
    "value": "number | string | object",
    "unit": "string | null",
    "recorded_at": "datetime",
    "source": "enum: manual | sensor | system | derived"
  },
  
  "comparison": {
    "predicted_value": "number | string",
    "actual_value": "number | string",
    "difference": "number | null",
    "difference_percent": "number | null",
    "within_confidence_interval": "boolean",
    "accuracy_score": "number (0-1)"
  },
  
  "evaluation": {
    "is_accurate": "boolean",
    "accuracy_category": "enum: exact | close | acceptable | missed | wrong",
    "direction_correct": "boolean | null (for trend predictions)"
  },
  
  "impact": {
    "action_taken": "boolean",
    "action_description": "string | null",
    "outcome_if_ignored": "string | null (estimated)",
    "value_added": "number | null (estimated savings/gains)"
  },
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ outcome_id: 1 }` - Unique
- `{ prediction_id: 1 }` - Unique (one outcome per prediction)
- `{ account_key: 1, "evaluation.is_accurate": 1 }` - Accuracy analysis

---

## Collection: ai_feedback

User feedback on AI outputs for reinforcement learning.

```json
{
  "_id": "ObjectId",
  "feedback_id": "string (12-digit) - PRIMARY KEY",
  "request_id": "string | null",
  "prediction_id": "string | null",
  "account_key": "string - REQUIRED",
  "user_key": "string - REQUIRED",
  
  "feedback_type": "enum: rating | correction | rejection | acceptance | suggestion",
  
  "rating": {
    "score": "number (1-5) | null",
    "helpful": "boolean | null",
    "accurate": "boolean | null"
  },
  
  "correction": {
    "original_value": "string | number",
    "corrected_value": "string | number",
    "correction_reason": "string"
  },
  
  "action_taken": {
    "accepted": "boolean",
    "modified": "boolean",
    "rejected": "boolean",
    "reason": "string | null"
  },
  
  "qualitative": {
    "comment": "string | null",
    "tags": ["string (e.g., 'too_conservative', 'missed_context')"]
  },
  
  "context": {
    "feature": "string",
    "prediction_type": "string | null",
    "entity_type": "string | null",
    "entity_id": "string | null"
  },
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ feedback_id: 1 }` - Unique
- `{ request_id: 1 }` - Feedback for request
- `{ prediction_id: 1 }` - Feedback for prediction
- `{ account_key: 1, feedback_type: 1, created_at: -1 }` - Feedback analysis

---

## Collection: ai_conversations

Chat/conversation history for context continuity.

```json
{
  "_id": "ObjectId",
  "conversation_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  "user_key": "string - REQUIRED",
  
  "title": "string (auto-generated or user-defined)",
  "feature": "string (e.g., 'assistant', 'report_builder')",
  
  "messages": [
    {
      "message_id": "string",
      "role": "enum: user | assistant | system",
      "content": "string",
      "timestamp": "datetime",
      "request_id": "string | null (links to ai_requests)",
      "tokens": "number"
    }
  ],
  
  "context": {
    "entities_discussed": [
      {
        "entity_type": "string",
        "entity_id": "string",
        "entity_name": "string"
      }
    ],
    "topics": ["string"],
    "summary": "string (AI-generated summary)"
  },
  
  "metadata": {
    "total_messages": "number",
    "total_tokens": "number",
    "total_cost": "number",
    "average_response_time_ms": "number"
  },
  
  "status": "enum: active | archived | deleted",
  
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_message_at": "datetime"
}
```

**Indexes:**
- `{ conversation_id: 1 }` - Unique
- `{ account_key: 1, user_key: 1, status: 1 }` - User's conversations
- `{ account_key: 1, last_message_at: -1 }` - Recent conversations

---

## Collection: ai_learning

Learned patterns and insights for continuous improvement.

```json
{
  "_id": "ObjectId",
  "learning_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string | null (null = global learning)",
  
  "learning_type": "enum: pattern | correction | preference | context | error",
  
  "category": {
    "feature": "string",
    "prediction_type": "string | null",
    "entity_type": "string | null"
  },
  
  "pattern": {
    "description": "string",
    "conditions": "object (when this pattern applies)",
    "frequency": "number (times observed)",
    "confidence": "number (0-1)"
  },
  
  "insight": {
    "what_works": "string | null",
    "what_fails": "string | null",
    "adjustment": "string (how AI should adjust)"
  },
  
  "evidence": {
    "supporting_predictions": "number",
    "success_rate": "number",
    "sample_prediction_ids": ["string"]
  },
  
  "application": {
    "auto_apply": "boolean",
    "prompt_modifier": "string | null",
    "parameter_adjustments": "object | null"
  },
  
  "status": "enum: active | deprecated | testing",
  "effectiveness_score": "number (0-1)",
  
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_applied_at": "datetime | null"
}
```

**Indexes:**
- `{ learning_id: 1 }` - Unique
- `{ account_key: 1, learning_type: 1, status: 1 }` - Active learnings
- `{ "category.feature": 1, "category.prediction_type": 1 }` - By feature

---

## Collection: ai_embeddings

Vector embeddings for semantic search and similarity.

```json
{
  "_id": "ObjectId",
  "embedding_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "source": {
    "type": "enum: prediction | feedback | conversation | document | entity",
    "source_id": "string",
    "content_hash": "string"
  },
  
  "text": "string (original text, truncated if long)",
  "text_length": "number",
  
  "embedding": {
    "model": "string (e.g., 'text-embedding-3-small')",
    "dimensions": "number",
    "vector": "[number] (stored as binary for efficiency)"
  },
  
  "metadata": {
    "entity_type": "string | null",
    "entity_id": "string | null",
    "prediction_type": "string | null",
    "tags": ["string"]
  },
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ embedding_id: 1 }` - Unique
- `{ "source.content_hash": 1 }` - Deduplication
- Vector index for similarity search (MongoDB Atlas Search or separate vector DB)

---

## Collection: ai_usage_summary

Aggregated usage statistics for billing and analytics.

```json
{
  "_id": "ObjectId",
  "summary_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "period": {
    "type": "enum: daily | weekly | monthly",
    "start_date": "datetime",
    "end_date": "datetime"
  },
  
  "usage": {
    "total_requests": "number",
    "total_input_tokens": "number",
    "total_output_tokens": "number",
    "total_tokens": "number",
    "total_cost": "number"
  },
  
  "by_feature": {
    "water_quality_prediction": { "requests": "number", "tokens": "number", "cost": "number" },
    "feed_optimization": { "requests": "number", "tokens": "number", "cost": "number" },
    "chatbot": { "requests": "number", "tokens": "number", "cost": "number" }
  },
  
  "by_model": {
    "gpt-4": { "requests": "number", "tokens": "number", "cost": "number" },
    "claude-3": { "requests": "number", "tokens": "number", "cost": "number" }
  },
  
  "performance": {
    "avg_latency_ms": "number",
    "p95_latency_ms": "number",
    "error_rate": "number",
    "cache_hit_rate": "number"
  },
  
  "accuracy": {
    "predictions_made": "number",
    "predictions_validated": "number",
    "accuracy_rate": "number",
    "avg_confidence": "number"
  },
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ summary_id: 1 }` - Unique
- `{ account_key: 1, "period.type": 1, "period.start_date": -1 }` - Usage history

---

## Collection: ai_prompts

Prompt templates and versions for consistency.

```json
{
  "_id": "ObjectId",
  "prompt_id": "string (12-digit) - PRIMARY KEY",
  
  "name": "string - REQUIRED",
  "feature": "string",
  "prediction_type": "string | null",
  
  "template": {
    "system_prompt": "string",
    "user_prompt_template": "string (with {{variables}})",
    "variables": ["string (required variables)"],
    "examples": [
      {
        "input": "object",
        "output": "string"
      }
    ]
  },
  
  "config": {
    "model_id": "string | null (preferred model)",
    "temperature": "number",
    "max_tokens": "number"
  },
  
  "version": "number",
  "is_active": "boolean",
  "is_default": "boolean",
  
  "performance": {
    "times_used": "number",
    "avg_accuracy": "number",
    "avg_feedback_score": "number"
  },
  
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ prompt_id: 1 }` - Unique
- `{ feature: 1, is_active: 1, is_default: 1 }` - Active prompts

---

## Learning Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AI LEARNING LOOP                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. REQUEST                                                                         │
│     User asks for prediction                                                        │
│     └─► Stored in ai_requests                                                       │
│                                                                                      │
│  2. CONTEXT RETRIEVAL                                                               │
│     Find similar past predictions                                                   │
│     └─► Query ai_embeddings (similarity search)                                     │
│     └─► Query ai_learning (relevant patterns)                                       │
│                                                                                      │
│  3. PREDICTION                                                                      │
│     AI makes prediction with context                                                │
│     └─► Stored in ai_predictions                                                    │
│                                                                                      │
│  4. USER FEEDBACK                                                                   │
│     User accepts/rejects/modifies                                                   │
│     └─► Stored in ai_feedback                                                       │
│                                                                                      │
│  5. OUTCOME RECORDING                                                               │
│     Actual result recorded later                                                    │
│     └─► Stored in ai_outcomes                                                       │
│     └─► Linked to original prediction                                               │
│                                                                                      │
│  6. LEARNING EXTRACTION                                                             │
│     Background job analyzes outcomes                                                │
│     └─► Patterns extracted → ai_learning                                            │
│     └─► Prompt adjustments → ai_prompts                                             │
│     └─► Model preferences updated                                                   │
│                                                                                      │
│  7. NEXT PREDICTION                                                                 │
│     Uses learned patterns                                                           │
│     └─► Better context, higher accuracy                                             │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Self-Learning Mechanism

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SELF-IMPROVEMENT CYCLE                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  DAILY ANALYSIS JOB:                                                                │
│  ───────────────────                                                                │
│                                                                                      │
│  1. Collect all validated predictions from yesterday                                │
│                                                                                      │
│  2. Group by prediction_type + entity_type                                          │
│                                                                                      │
│  3. For each group:                                                                 │
│     │                                                                                │
│     ├─► Calculate accuracy rate                                                     │
│     │                                                                                │
│     ├─► If accuracy < 70%:                                                          │
│     │   └─► Analyze common factors in failures                                      │
│     │   └─► Generate learning: "For X conditions, adjust Y"                         │
│     │   └─► Store in ai_learning with status=testing                                │
│     │                                                                                │
│     ├─► If accuracy > 90%:                                                          │
│     │   └─► Extract successful patterns                                             │
│     │   └─► Store in ai_learning for reuse                                          │
│     │                                                                                │
│     └─► Update ai_usage_summary                                                     │
│                                                                                      │
│  4. Promote tested learnings if effective                                           │
│     └─► status: testing → active                                                    │
│                                                                                      │
│  5. Deprecate ineffective learnings                                                 │
│     └─► status: active → deprecated                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Context Building for Predictions

```python
def build_prediction_context(account_key, entity_id, prediction_type):
    """Build rich context for AI prediction."""
    
    context = {
        "historical_predictions": [],
        "learned_patterns": [],
        "similar_cases": [],
        "user_preferences": []
    }
    
    # 1. Get past predictions for this entity
    past = ai_predictions.find({
        "account_key": account_key,
        "target.entity_id": entity_id,
        "prediction_type": prediction_type,
        "status": "validated"
    }).sort("created_at", -1).limit(10)
    
    for p in past:
        outcome = ai_outcomes.find_one({"prediction_id": p["prediction_id"]})
        context["historical_predictions"].append({
            "predicted": p["prediction"]["value"],
            "actual": outcome["actual"]["value"] if outcome else None,
            "accurate": outcome["evaluation"]["is_accurate"] if outcome else None,
            "conditions": p["input_context"]["data_snapshot"]
        })
    
    # 2. Get relevant learned patterns
    patterns = ai_learning.find({
        "$or": [
            {"account_key": account_key},
            {"account_key": None}  # Global patterns
        ],
        "category.prediction_type": prediction_type,
        "status": "active"
    }).sort("effectiveness_score", -1).limit(5)
    
    context["learned_patterns"] = list(patterns)
    
    # 3. Find similar cases via embeddings
    # (simplified - would use vector similarity search)
    
    # 4. Get user feedback preferences
    preferences = ai_feedback.aggregate([
        {"$match": {"account_key": account_key, "context.prediction_type": prediction_type}},
        {"$group": {"_id": "$qualitative.tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ])
    
    context["user_preferences"] = list(preferences)
    
    return context
```

---

## API Endpoints

```http
# AI Requests
POST   /api/ai/predict                  # Make prediction
GET    /api/ai/requests                 # List AI requests
GET    /api/ai/requests/:id             # Get request details

# Predictions
GET    /api/ai/predictions              # List predictions
GET    /api/ai/predictions/:id          # Get prediction details
POST   /api/ai/predictions/:id/validate # Record actual outcome

# Feedback
POST   /api/ai/feedback                 # Submit feedback
GET    /api/ai/feedback                 # List feedback

# Conversations
POST   /api/ai/chat                     # Send chat message
GET    /api/ai/conversations            # List conversations
GET    /api/ai/conversations/:id        # Get conversation
DELETE /api/ai/conversations/:id        # Delete conversation

# Usage & Analytics
GET    /api/ai/usage                    # Get usage summary
GET    /api/ai/accuracy                 # Get accuracy stats
GET    /api/ai/learnings                # Get learned patterns

# Admin
GET    /api/ai/models                   # List available models
PUT    /api/ai/models/:id               # Update model config
GET    /api/ai/prompts                  # List prompts
PUT    /api/ai/prompts/:id              # Update prompt
```

---

## Benefits of This Design

| Benefit | How Achieved |
|---------|--------------|
| **Full Traceability** | Every AI call logged with input/output |
| **Cost Tracking** | Token usage and costs per request |
| **Accuracy Measurement** | Predictions linked to actual outcomes |
| **Continuous Learning** | Patterns extracted from feedback & outcomes |
| **Context Awareness** | Similar cases retrieved for better predictions |
| **User Personalization** | Feedback shapes future responses |
| **Audit Compliance** | Complete history of AI decisions |
| **Performance Optimization** | Identify slow/failing patterns |
