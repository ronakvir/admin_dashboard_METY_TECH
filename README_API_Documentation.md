# 📡 API Documentation – Full JSON Structures


# 📖 Table of Contents – API Documentation

- [🔑 API Keys](#-api-keys)  
  - [Create API Key](#create-api-key)  

- [📋 Questionnaires](#-questionnaires)  
  - [Create Questionnaire](#create-questionnaire)  
  - [Update Questionnaire](#update-questionnaire)  

- [❓ Questions & Answers](#-questions--answers)  
  - [Create Question](#create-question)  
  - [Create Answer](#create-answer)  

- [🧩 Logic Mappings](#-logic-mappings)  
  - [Add Mapping](#add-mapping)  

- [🎥 Videos](#-videos)  
  - [Create Video](#create-video)  
  - [Search Videos](#search-videos)  
  - [Delete Video](#delete-video)  

- [🌐 Public API](#-public-api)  
  - [Get Questionnaire (Public)](#get-questionnaire-public)  
  - [Preview Videos](#preview-videos)  


## 🔑 API Keys

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
  "is_active": true,
  "created_at": "2025-09-21T10:00:00Z",
  "last_used": null
}
```

---

## 📋 Questionnaires

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

---

### Update Questionnaire
**PATCH** `/api/questionnaires/{id}/`

**Request**
```json
{
  "status": "published"
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

---

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

---

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

---

### Delete Video
**DELETE** `/api/videos/{id}/`

**Response**
```json
{}
```

---

## 🌐 Public API

### Get Questionnaire (Public)  
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

---

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
