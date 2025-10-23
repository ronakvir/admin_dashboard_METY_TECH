# 📡 API Documentation – Full JSON Structures

# 📖 Table of Contents – API Documentation

- [🔑 API Keys](#-api-keys)  
  - [List API Keys](#list-api-keys)  
  - [Get API Key by ID](#get-api-key-by-id)  
  - [Create API Key](#create-api-key)  

- [🧠 AI Management](#-ai-management)  
  - [Get AI Configurations](#get-ai-configurations)  

- [📋 Questionnaires](#-questionnaires)  
  - [List Questionnaires](#list-questionnaires)  
  - [Get Questionnaire by ID](#get-questionnaire-by-id)  
  - [Create Questionnaire](#create-questionnaire)  
  - [Update Questionnaire](#update-questionnaire)  

- [❓ Questions & Answers](#-questions--answers)  
  - [List Questions](#list-questions)  
  - [Get Questions for a Questionnaire](#get-questions-for-a-questionnaire)  
  - [Create Question](#create-question)  
  - [Create Answer](#create-answer)  

- [🧩 Logic Mappings](#-logic-mappings)  
  - [Get Categories](#get-categories)  
  - [Get Questionnaires for Mapping](#get-questionnaires-for-mapping)  
  - [Add Mapping](#add-mapping)  

- [🎥 Videos](#-videos)  
  - [Create Video](#create-video)  
  - [Search Videos](#search-videos)  
  - [Delete Video](#delete-video)  

- [👤 Users](#-users)  
  - [List Users](#list-users)  
  - [Get User by ID](#get-user-by-id)  
  - [Login](#login)  
  - [Register](#register)  

- [👩‍💼 Admin Management](#-admin-management)  
  - [List Admins](#list-admins)  

- [🌐 Public API](#-public-api)  
  - [Get Public Questionnaire](#get-public-questionnaire)  
  - [Preview Videos](#preview-videos)  

- [🛠 REST Check](#-rest-check)  
  - [Check REST API](#check-rest-api)  

---

## 🔑 API Keys

### List API Keys
**GET** `/api/apikeys/`

**Response**
```json
[
  {
    "id": 1,
    "name": "Frontend Client",
    "key": "d3f8a8d2-4e2a-4c91-a9d5-3e2a9c22e2df",
    "is_active": true,
    "created_at": "2025-09-21T10:00:00Z",
    "last_used": null
  }
]
```

### Get API Key by ID
**GET** `/api/apikeys/{key_id}/`

**Response**
```json
{
  "id": 1,
  "name": "Frontend Client",
  "key": "d3f8a8d2-4e2a-4c91-a9d5-3e2a9c22e2df",
  "is_active": true
}
```

### Create API Key
**POST** `/api/apikeys/`

**Request**
```json
{
  "name": "Frontend Client"
}
```

**Response**
```json
{
  "id": 1,
  "name": "Frontend Client",
  "key": "d3f8a8d2-4e2a-4c91-a9d5-3e2a9c22e2df",
  "is_active": true
}
```

---

## 🧠 AI Management


## 🧠 AI Query

### GET AI Workout Recommendation

**POST** `/api/aiquery/`
Submits a list of questionnaire questions and answers, and returns a structured workout plan JSON.

**Request**

```json
[
  {
    "question": "What is your primary fitness goal?",
    "answers": ["Build muscle"]
  },
  {
    "question": "How many days per week can you train?",
    "answers": ["3"]
  }
]
```

**Response**

```json
{
  "week_number": 1,
  "days": [
    {
      "day_number": 1,
      "duration_seconds": 3600,
      "title": "Full Body Strength",
      "segments": [
        {
          "activity": "Warmup",
          "duration_seconds": 600,
          "sets": 1,
          "segments": [
            {
              "exercise": "Jump Rope",
              "duration_seconds": 300,
              "notes": "Light intensity to increase heart rate.",
              "url": "https://example.com/jumprope"
            }
          ]
        },
        {
          "activity": "Main Workout",
          "duration_seconds": 2400,
          "sets": 3,
          "segments": [
            {
              "exercise": "Squats",
              "duration_seconds": 60,
              "notes": "3 sets of 10 reps with moderate weight.",
              "url": "https://example.com/squats"
            }
          ]
        }
      ],
      "total_duration_seconds": 3600,
      "difficulty": "Intermediate",
      "goal": "Build muscle"
    }
  ]
}
```


---

### Get AI Configurations

**GET** `/api/aimanagement/`
Retrieves a list of all configured AI model integrations.

**Response**

```json
[
  {
    "uid": "d87e01af-52b8-4a1f-8e2a-9b602de439e9",
    "name": "Gemini",
    "model_name": "gemini-pro",
    "order": 1,
    "created_at": "2025-09-15T10:00:00Z",
    "updated_at": "2025-09-21T12:34:56Z"
  }
]
```

---

### Create AI Configuration

**POST** `/api/aimanagement/`
Creates a new AI model configuration entry.

**Request**

```json
{
  "name": "Gemini",
  "model_name": "gemini-pro",
  "api_key": "your-api-key",
  "system_prompt": "You are an assistant that generates exercise advice.",
  "order": 1
}
```

**Response**

```json
{
  "uid": "2b1d0f44-8a88-49c2-b617-5b1e9115b92a",
  "name": "Gemini",
  "model_name": "gemini-pro",
  "order": 1
}
```

---

### Update AI Configuration

**PUT** `/api/aimanagement/{uid}/`
Updates an existing AI model configuration.

**Request**

```json
{
  "model_name": "gemini-1.5-pro",
  "order": 2
}
```

**Response**

```json
{
  "uid": "2b1d0f44-8a88-49c2-b617-5b1e9115b92a",
  "name": "Gemini",
  "model_name": "gemini-1.5-pro",
  "order": 2
}
```

---

### Delete AI Configuration

**DELETE** `/api/aimanagement/{uid}/`
Deletes an existing AI configuration.

**Response**

```json
{}
```

---

## 📋 Questionnaires

### Get All Questionnaires
**GET** `/api/questionnairebuilder/getquestionnaires/`

**Response**
```json
[
  { "id": 45, "title": "Fitness Assessment", "status": "published" },
  { "id": 46, "title": "Wellness Survey", "status": "draft" }
]
```

### Get Questionnaire by ID
**GET** `/api/public/questionnaires/{id}/`

**Response**
```json
{
  "title": "Fitness Assessment",
  "questions": [
    {
      "id": 18,
      "text": "How many times do you exercise per week?",
      "type": "single-choice",
      "answer_choices": [
        { "id": 31, "text": "1-2 times" },
        { "id": 32, "text": "3-5 times" },
        { "id": 33, "text": "6+ times" }
      ]
    }
  ]
}
```

### Create Questionnaire
**POST** `/api/questionnaires/`

**Request**
```json
{
  "title": "Fitness Assessment",
  "status": "draft",
  "questions": [12, 13, 14]
}
```

**Response**
```json
{
  "id": 45,
  "title": "Fitness Assessment",
  "status": "draft",
  "started_at": "2025-09-21T10:05:00Z",
  "completed_at": null,
  "questions": [12, 13, 14]
}
```

### Update Questionnaire
**PATCH** `/api/questionnaires/{id}/`

**Request**
```json
{
  "title": "Fitness Assessment",
  "status": "published",
  "questions": [12, 13, 14]
}
```

**Response**
```json
{
  "id": 45,
  "title": "Fitness Assessment",
  "status": "published",
  "started_at": "2025-09-21T10:05:00Z",
  "completed_at": "2025-09-21T10:15:00Z",
  "questions": [12, 13, 14]
}
```

---

## ❓ Questions & Answers

### Get All Questions
**GET** `/api/questionnairebuilder/getquestions/`

**Response**
```json
[
  { "id": 18, "text": "How many times do you exercise per week?" },
  { "id": 19, "text": "Do you stretch before workouts?" }
]
```

### Get Questions for a Questionnaire
**GET** `/api/logicbuilder/getquestions/{questionnaire_id}`

**Response**
```json
[
  { "id": 18, "text": "How many times do you exercise per week?" },
  { "id": 19, "text": "Do you prefer indoor or outdoor workouts?" }
]
```

### Create Question
**POST** `/api/questions/`

**Request**
```json
{
  "text": "How many times do you exercise per week?",
  "type": "single-choice",
  "answers": [
    { "text": "1-2 times" },
    { "text": "3-5 times" },
    { "text": "6+ times" }
  ]
}
```

**Response**
```json
{
  "id": 18,
  "text": "How many times do you exercise per week?",
  "type": "single-choice",
  "answers": [
    { "id": 31, "question": 18, "text": "1-2 times" },
    { "id": 32, "question": 18, "text": "3-5 times" },
    { "id": 33, "question": 18, "text": "6+ times" }
  ]
}
```

### Create Answer
**POST** `/api/answers/`

**Request**
```json
{
  "question": 18,
  "text": "None"
}
```

**Response**
```json
{
  "id": 34,
  "question": 18,
  "text": "None"
}
```

---

## 🧩 Logic Mappings

### Get Categories
**GET** `/api/logicbuilder/getcategories/`

**Response**
```json
[
  { "id": 1, "name": "Strength" },
  { "id": 2, "name": "Flexibility" }
]
```

### Get Questionnaires for Mapping
**GET** `/api/logicbuilder/getquestionnaires/`

**Response**
```json
[
  { "id": 45, "title": "Fitness Assessment" },
  { "id": 46, "title": "Nutrition Survey" }
]
```

### Add Mapping
**POST** `/api/mappings/`

**Request**
```json
{
  "questionnaire_id": 45,
  "answer_id": 31,
  "category_id": 3,
  "inclusive": true
}
```

**Response**
```json
{
  "id": 9,
  "questionnaire_id": 45,
  "answer_id": 31,
  "category_id": 3,
  "inclusive": true
}
```

---

## 🎥 Videos

### Create Video
**POST** `/api/videos/`

**Request**
```json
{
  "title": "Strength Training Basics",
  "duration": "10:32",
  "description": "Full body beginner workout",
  "url": "http://example.com/video.mp4",
  "categories": [
    { "id": 1, "text": "Strength" },
    { "id": 2, "text": "Beginner" }
  ]
}
```

**Response**
```json
{
  "id": 12,
  "title": "Strength Training Basics",
  "duration": "10:32",
  "description": "Full body beginner workout",
  "url": "http://example.com/video.mp4",
  "categories": [
    { "id": 1, "text": "Strength" },
    { "id": 2, "text": "Beginner" }
  ]
}
```

### Search Videos
**POST** `/api/videos/search/`

**Request**
```json
{
  "title": "strength",
  "duration": "10",
  "category": "Beginner"
}
```

**Response**
```json
[
  {
    "id": 12,
    "title": "Strength Training Basics",
    "duration": "10:32",
    "description": "Full body beginner workout",
    "url": "http://example.com/video.mp4",
    "categories": [
      { "id": 1, "text": "Strength" },
      { "id": 2, "text": "Beginner" }
    ]
  }
]
```

### Delete Video
**DELETE** `/api/videos/{id}/`

**Response**
```json
{}
```

---

## 👤 Users

### List Users
**GET** `/api/users/`

**Response**
```json
{
  "count": 2,
  "results": [
    { "id": 1, "username": "admin", "email": "admin@example.com" },
    { "id": 2, "username": "user", "email": "user@example.com" }
  ]
}
```

### Get User by ID
**GET** `/api/users/{id}/`

**Response**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com"
}
```

### Login
**POST** `/api/users/login/`

**Request**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "token": "abc123token",
  "user": { "id": 1, "username": "admin", "email": "admin@example.com" }
}
```

### Register
**POST** `/api/users/register/`

**Request**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "id": 3,
  "username": "newuser",
  "email": "newuser@example.com"
}
```

---

## 👩‍💼 Admin Management

### List Admins
**GET** `/api/admin-management/`

**Response**
```json
[
  { "id": 1, "username": "admin", "is_superuser": true },
  { "id": 2, "username": "moderator", "is_superuser": false }
]
```

---

## 🌐 Public API

### Get Public Questionnaire
**GET** `/api/public/questionnaire/`

**Response**
```json
{
  "title": "Fitness Assessment",
  "questions": [
    {
      "id": 18,
      "text": "How many times do you exercise per week?",
      "answers": [
        { "id": 31, "text": "1-2 times" },
        { "id": 32, "text": "3-5 times" }
      ]
    }
  ]
}
```

### Preview Videos
**POST** `/api/public/preview/`

**Request**
```json
{
  "questionnaire_id": 45,
  "answer_ids": [31, 32]
}
```

**Response**
```json
[
  {
    "id": 12,
    "title": "Strength Training Basics",
    "duration": "10:32",
    "description": "Full body beginner workout",
    "url": "http://example.com/video.mp4",
    "count": 2
  }
]
```

---

## 🛠 REST Check

### Check REST API
**GET** `/api/rest/rest-check/`

**Response**
```json
{
  "message": "REST API is working"
}
```

