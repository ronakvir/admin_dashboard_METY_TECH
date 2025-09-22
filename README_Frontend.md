# 🛠 Questionnaire Admin Dashboard – Frontend

A **React + TypeScript** application providing login/registration, admin tools, questionnaire builder, video management, and logic mapping.  
This README documents the project structure, components, admin modules, and API layer.  

---

# 📖 Table of Contents

- [🏠 Core Pages & Admin Navigation](#core-pages--admin-navigation)  
- [🧩 Questionnaire Builder Module](#questionnaire-builder-module)  
- [🧩 Logic Builder Module](#logic-builder-module)  
- [🎥 Video Management Module](#video-management-module)  
- [🔌 API Layer](#api-layer)  




# 🏠 Core Pages & Admin Navigation

Reference hierarchy:

```text
frontend/js/pages/
├── Home.tsx              # Login screen
├── Register.tsx          # Registration screen
└── admin/
    ├── Dashboard.tsx     # Admin dashboard (with <SidePanel /> + <Outlet />)
    └── SidePanel.tsx     # Sidebar navigation
```

---

### **frontend/js/pages/Home.tsx**
- **Route**: `/`
- **Purpose**: Login screen  

- **Functions**:
  - `handleChange(e: ChangeEvent<HTMLInputElement>)` → updates form data (**Helper Function**)  
  - `handleSubmit(e: FormEvent)` → attempts login (**API Call**)  
  - `handleRegisterClick()` → navigates to `/register` (**Helper Function**)  

---

### **frontend/js/pages/Register.tsx**
- **Route**: `/register`
- **Purpose**: Registration screen  

- **Functions**:
  - `verifyToken(token: string)` → checks invite token validity (**API Call**)  
  - `handleTokenSubmit(e: FormEvent)` → triggers token verification (**Helper Function**)  
  - `handleSubmit(e: FormEvent)` → submits registration request (**API Call**)  

---

### **frontend/js/pages/admin/Dashboard.tsx**
- **Route**: `/dashboard`
- **Purpose**: Base admin page  

- **Components Rendered**:
  - `<SidePanel />` → persistent navigation sidebar  
  - `<Outlet />` → swaps subcomponents (e.g., Questionnaire Builder, Logic Builder, etc.)  

---

### **frontend/js/pages/admin/SidePanel.tsx**
- **Purpose**: Persistent sidebar navigation  

- **Functions**:
  - `UserManagement()` → navigates to `/dashboard/usermanagement` (**Helper Function**)  
  - `QuestionnaireBuilder()` → navigates to `/dashboard/questionnairebuilder` (**Helper Function**)  
  - `VideoLibrary()` → navigates to `/dashboard/videolibrary` (**Helper Function**)  
  - `LogicBuilder()` → navigates to `/dashboard/logicbuilder` (**Helper Function**)  
  - `ApiKeyManagement()` → navigates to `/dashboard/apikeys` (**Helper Function**)  
  - `handleLogout()` → logs out via API, navigates to `/` (**API Call**)  

---


---
# 🧩 Questionnaire Builder Module

The **Questionnaire Builder** is an administrative tool that allows creating, editing, previewing, and managing questionnaires.  
It consists of multiple React components:

- `QuestionnaireBuilder.tsx` → Base page for questionnaire management  
- `ComponentList.tsx` → Builds searchable list of questionnaires  
- `ComponentPreview.tsx` → Displays questionnaire preview & sample video results  
- `ComponentQuestions.tsx` → Manages creation/editing of questions  
- `ComponentRecents.tsx` → Displays recently updated questionnaires  
- `ComponentWorkshop.tsx` → Full workshop editor for questionnaires  

Reference hierarchy:

```text
frontend/js/pages/admin/Questionnaire/
├── QuestionnaireBuilder.tsx
├── ComponentList.tsx
├── ComponentPreview.tsx
├── ComponentQuestions.tsx
├── ComponentRecents.tsx
└── ComponentWorkshop.tsx

```
---

---

## 📄 File Documentation

### **frontend/js/pages/admin/Questionnaire/QuestionnaireBuilder.tsx**
- **Purpose**: Base page for questionnaire management:contentReference[oaicite:0]{index=0}  
- **State Management**:
  - Stores questionnaires, questions, recents, and preview/workshop toggles.  
- **Behavior**:
  - Renders **Recents + List** by default.  
  - Switches to **Workshop** when editing/creating.  
  - Displays `<ComponentQuestions />` and `<ComponentPreview />` when needed.  
- **Key Function**:
  - `questionnaireSection()` → Determines whether to render recents/list or workshop (**Helper Function**).  

---

### **frontend/js/pages/admin/Questionnaire/ComponentList.tsx**
- **Purpose**: Builds a searchable, filterable list of questionnaires:contentReference[oaicite:1]{index=1}  
- **Type**: **Helper Component** (stateless, uses props only).  

---

### **frontend/js/pages/admin/Questionnaire/ComponentPreview.tsx**
- **Purpose**: Displays questionnaire preview and shows sample matched videos:contentReference[oaicite:2]{index=2}  
- **Key Functions**:
  - `returnToDashboard()` → Exits preview and resets state (**Helper Function**).  
  - `updateResponses(answer, index)` → Updates local responses array (**Helper Function**).  
  - `submitAnswers()` → Submits answers to backend and fetches matched videos (**API Call**).  

---

### **frontend/js/pages/admin/Questionnaire/ComponentQuestions.tsx**
- **Purpose**: Manages the creation and editing of questions:contentReference[oaicite:3]{index=3}  
- **Key Functions**:
  - `addQuestionForms()` → Builds UI for new questions (**Helper Function**).  
  - `addAnswerField()` → Dynamically adds answer option (**Helper Function**).  
  - `removeAnswerField()` → Removes answer option (**Helper Function**).  
  - `selectQuestion()` → Selects a question from the list (**Helper Function**).  
  - `addQuestion()` → Adds a new question to DB (**API Call**).  
  - `modifyQuestion()` → Updates an existing question in DB (**API Call**).  
  - `deleteQuestion()` → Deletes a question from DB (**API Call**).  
  - `addToQuestionnaire()` → Temporarily attaches question to questionnaire (**Helper Function**).  
  - `clearForms()` → Resets all forms (**Helper Function**).  

---

### **frontend/js/pages/admin/Questionnaire/ComponentRecents.tsx**
- **Purpose**: Displays recently updated questionnaires:contentReference[oaicite:4]{index=4}  
- **Key Functions**:
  - `updateRecentsList()` → Refreshes recent questionnaires (**Helper Function**).  
  - `editQuestionnaireButton()` → Opens workshop to edit questionnaire (**Helper Function**).  
  - `previewQuestionnaireButton()` → Opens preview mode (**Helper Function**).  
  - `deleteQuestionnaireButton()` → Deletes a questionnaire (**API Call**).  

---

### **frontend/js/pages/admin/Questionnaire/ComponentWorkshop.tsx**
- **Purpose**: Full editor for creating and modifying questionnaires:contentReference[oaicite:5]{index=5}  
- **Key Functions**:
  - `removeFromQuestionnaire()` → Temporarily removes a question from questionnaire (**Helper Function**).  
  - `createQuestionnaireButton()` → Creates a new questionnaire in DB (**API Call**).  
  - `modifyQuestionnaireButton()` → Updates existing questionnaire in DB (**API Call**).  
  - `cancelQuestionnaireButton()` → Cancels workshop and returns to list view (**Helper Function**).  
  - `deleteQuestionnaireButton()` → Deletes questionnaire from DB (**API Call**).  

---

### 🔑 API vs Helper

- **API Calls**:
  - `questionnairebuilderGetvideosCreate` → preview video matches  
  - `addQuestion`, `modifyQuestion`, `deleteQuestion` → manage questions  
  - `createQuestionnaireButton`, `modifyQuestionnaireButton`, `deleteQuestionnaireButton` → manage questionnaires  

- **Helper Functions**:
  - UI state handling (toggle preview, reset forms, edit selection, etc.)  
  - Temporary state updates (add/remove questions, update responses, etc.)  

---

###



# 🧩 Logic Builder Module

The **Logic Builder** is an administrative tool that allows mapping of questionnaire responses to categories.  
It consists of three main React components:

- `LogicBuilder.tsx` → Entry point for the logic builder feature  
- `CQuestionnaireSelection.tsx` → Selects and previews questionnaires  
- `CLogicWorkshop.tsx` → Workshop for mapping responses to categories  

Reference hierarchy (from DOM guide):

```text
frontend/js/pages/admin/LogicBuilder/
├── LogicBuilder.tsx
├── CQuestionnaireSelection.tsx
└── CLogicWorkshop.tsx
```



---

## 📄 File Documentation

### **frontend/js/pages/admin/LogicBuilder/LogicBuilder.tsx**
- **Purpose**: Base page for the administrator’s Logic Builder:contentReference[oaicite:0]{index=0}  
- **State Management**:
  - `questionnaireList` ← list of available questionnaires  
  - `categoryList` ← list of available categories  
  - `questionList` ← list of questions for selected questionnaire  
  - `selectedLink` ← currently selected question/answer pair for editing  
  - `linkWorkshop` ← boolean toggle to show/hide the workshop view  
  - `selectedQuestionnaire` ← active questionnaire being edited  
  - `expandedQuestions` ← expanded/collapsed state for table rows  
- **Behavior**:
  - On page load, fetches questionnaires from the database using `LogicbuilderService.logicbuilderGetquestionnairesRetrieve()`:contentReference[oaicite:1]{index=1}  
  - Renders `<CQuestionnaireSelection />` and passes all state down as props.  

---

### **frontend/js/pages/admin/LogicBuilder/CQuestionnaireSelection.tsx**
- **Purpose**: Handles questionnaire selection, data fetching, and preview:contentReference[oaicite:2]{index=2}  
- **Key Functions**:
  - `clearStates()` → resets local state when navigating away (**Helper Function**)  
  - `selectQuestionnaire(questionnaireID)` → fetches questions & categories for the given questionnaire (**API Calls**)  
    - `LogicbuilderService.logicbuilderGetquestionsRetrieve()`  
    - `LogicbuilderService.logicbuilderGetcategoriesRetrieve()`  
- **UI Behavior**:
  - **Left Panel**: list of available questionnaires  
  - **Right Panel**: preview of selected questionnaire (shows question + mapped responses count)  
  - Button `Edit Questionnaire` → switches view into `<CLogicWorkshop />`  

---

### **frontend/js/pages/admin/LogicBuilder/CLogicWorkshop.tsx**
- **Purpose**: Workshop interface for response-category mapping:contentReference[oaicite:3]{index=3}  
- **State**:
  - `checkedInclusive` → determines whether a link is inclusive or exclusive  
- **Key Functions**:
  - `toggleExpand(idx)` → expands/collapses question rows (**Helper Function**)  
  - `handleEdit(q, a)` → selects a specific response for editing (**Helper Function**)  
  - `handleDelete(answerId)` → removes mapping for a response (**API Call**)  
    - `LogicbuilderService.logicbuilderDeletemappingDestroy()`  
  - `addLink(e, answerId)` → links a response to a category (**API Call**)  
    - `LogicbuilderService.logicbuilderAddmappingCreate()`  
- **UI Behavior**:
  - **Workshop Mode**: shows a table of questions/responses with expandable rows  
  - **Edit Mode**: allows linking/unlinking categories for a selected response  

---

### 🔑 API vs Helper

- **API Calls**:
  - `logicbuilderGetquestionnairesRetrieve` → fetch list of questionnaires  
  - `logicbuilderGetquestionsRetrieve` → fetch questions for a questionnaire  
  - `logicbuilderGetcategoriesRetrieve` → fetch categories  
  - `logicbuilderAddmappingCreate` → add response-category mapping  
  - `logicbuilderDeletemappingDestroy` → delete response-category mapping  

- **Helper Functions**:
  - UI state handling (toggle expand, reset state, edit selection, etc.)  
  - Temporary state updates (adding/removing categories locally before saving)  

---

### 🚀 Workflow

1. **LogicBuilder.tsx** loads and fetches questionnaires.  
2. **CQuestionnaireSelection.tsx** displays available questionnaires and fetches questions + categories when one is selected.  
3. Clicking **Edit Questionnaire** opens **CLogicWorkshop.tsx**.  
4. In the workshop:
   - Expand questions to see responses  
   - Link/unlink categories to responses  
   - Save changes via API  

---

### 🏗 Example Usage Flow

1. Admin opens **Logic Builder** → questionnaires load from DB.  
2. Admin selects a questionnaire → related questions & categories are fetched.  
3. Admin previews question/response mappings.  
4. Admin clicks **Edit Questionnaire** → enters workshop view.  
5. Admin links responses to categories (inclusive/exclusive).  
6. Admin saves changes → backend updates via API.  

---

# 🎥 Video Management Module

Reference hierarchy:

```text
frontend/js/pages/admin/VideoManagement/
├── VideoLibrary.tsx         # Entry point for video management
├── ComponentVideoSearch.tsx # Search, filter, add, delete videos
└── ComponentWorkshop.tsx    # Add/modify video details
```
---

## 📄 File Documentation

### **frontend/js/pages/admin/VideoManagement/VideoLibrary.tsx**
- **Purpose**: Base entry point for video management:contentReference[oaicite:0]{index=0}  
- **State Management**:
  - `searchFields` → active search filters (title, duration, category)  
  - `videoList` → current list of videos from search  
  - `selectedVideo` → video currently selected for modification  
  - `videoWorkshop` → determines whether in search mode or workshop mode  
  - `categoryList` → categories available for assignment  
- **Behavior**:
  - Fetches categories from backend (`logicbuilderGetcategoriesRetrieve`) on mount  
  - Renders either `<ComponentVideoSearch />` or `<ComponentWorkshop />` depending on state  

---

### **frontend/js/pages/admin/VideoManagement/ComponentVideoSearch.tsx**
- **Purpose**: Handles searching, listing, and basic video operations:contentReference[oaicite:1]{index=1}  

- **Key Functions**:
  - `updateTitleState()` → update search filter for title (**Helper Function**)  
  - `updateDurationState()` → update search filter for duration (**Helper Function**)  
  - `updateCategoryState()` → update search filter for category (**Helper Function**)  
  - `modifyVideoButton(video)` → select video and switch to modify workshop (**Helper Function**)  
  - `addVideoButton()` → clears state and opens workshop for adding video (**Helper Function**)  
  - `searchButton()` → searches videos from backend (**API Call**)  
    - `VideomanagementService.videomanagementGetvideosCreate()`  
  - `deleteVideoButton(videoID)` → deletes a video from backend (**API Call**)  
    - `VideomanagementService.videomanagementDeletevideoDestroy()`  

- **UI Behavior**:
  - Provides search form for videos (title, duration, category)  
  - Lists matching videos with details (title, duration, URL, categories)  
  - Buttons for **Modify** and **Delete** appear for each video  

---

### **frontend/js/pages/admin/VideoManagement/ComponentWorkshop.tsx**
- **Purpose**: Manages adding or modifying videos:contentReference[oaicite:2]{index=2}  

- **Key Functions**:
  - `updateTitleState()`, `updateDurationState()`, `updateUrlState()`, `updateDescriptionState()` → update video fields (**Helper Functions**)  
  - `updateCategoryState()` → modify categories inline (**Helper Function**)  
  - `removeCategoryField()` → removes a category field (**Helper Function**)  
  - `cancelButton()` → resets workshop and returns to search view (**Helper Function**)  
  - `addVideoButton()` → validates input and adds new video (**API Call**)  
    - uses `VideomanagementService.videomanagementCreatevideoCreate()`  
  - `modifyVideoButton()` → validates input and modifies existing video (**API Call**)  
    - uses `VideomanagementService.videomanagementCreatevideoCreate()`  

- **UI Behavior**:
  - Shows form for video details (title, URL, duration, categories, description)  
  - Allows adding/removing categories dynamically  
  - Switches between “Add New Video” and “Modify Video” modes  

---

### 🔑 API vs Helper

- **API Calls**:
  - `videomanagementGetvideosCreate` → fetch list of videos  
  - `videomanagementDeletevideoDestroy` → delete a video  
  - `videomanagementCreatevideoCreate` → add or modify a video  
  - `logicbuilderGetcategoriesRetrieve` → fetch category list  

- **Helper Functions**:
  - Handle form updates (title, URL, duration, category, description)  
  - UI state handling (toggle workshop, reset forms, cancel actions)  
  - Temporary state management for categories and selection  

---

### 🚀 Workflow

1. **VideoLibrary.tsx** loads and fetches category list.  
2. Default view: **ComponentVideoSearch** → search or add videos.  
3. Search results list videos with Modify/Delete options.  
4. Selecting **Add New Video** or **Modify** opens **ComponentWorkshop**.  
5. In **ComponentWorkshop**:
   - Admin edits title, URL, duration, categories, description.  
   - Admin confirms changes → backend updated via API.  

---

### 🏗 Example Usage Flow

1. Admin enters **Video Management** → categories load.  
2. Admin searches videos by title, duration, or category.  
3. Search results show → admin can modify or delete videos.  
4. Clicking **Add New Video** opens workshop with blank form.  
5. Admin fills in details → submits → API saves video.  
6. Admin modifies video → confirms → API updates video.  

---

# 🔌 API Layer

The **API layer** is located in `frontend/js/api/` and provides type-safe communication between the frontend and backend.  
It is primarily auto-generated from the backend’s OpenAPI schema and exposes strongly typed service calls used by all admin modules.

Reference hierarchy:

```text
frontend/js/api/
├── index.ts          # API client entry point
├── schemas.gen.ts    # Generated API request/response schemas
├── services.gen.ts   # Generated service functions for each API endpoint
└── types.gen.ts      # Shared TypeScript types used by schemas/services
```

---

## 📄 File Documentation

### **frontend/js/api/index.ts**
- **Purpose**: Main entry point for the API layer  
- **Behavior**:
  - Re-exports services and schemas for use across the app  
  - Provides a single import path (e.g., `import { VideomanagementService } from "@/js/api"`)  

---

### **frontend/js/api/schemas.gen.ts**
- **Purpose**: Contains generated schema definitions for all API request/response payloads  
- **Usage**:
  - Defines validation shapes for backend communication  
  - Ensures consistency between frontend code and backend contract  

---

### **frontend/js/api/services.gen.ts**
- **Purpose**: Core file with generated service functions that wrap backend endpoints  
- **Structure**:
  - Services grouped by domain:  
    - `QuestionnaireService` → questionnaire builder endpoints  
    - `LogicbuilderService` → logic builder endpoints  
    - `VideomanagementService` → video management endpoints  
  - Each service exposes CRUD-style methods (`Retrieve`, `Create`, `Modify`, `Destroy`)  

- **Examples**:
  - `LogicbuilderService.logicbuilderGetquestionnairesRetrieve()` → fetch list of questionnaires  
  - `QuestionnaireService.questionnairebuilderGetvideosCreate()` → submit answers, fetch videos  
  - `VideomanagementService.videomanagementDeletevideoDestroy()` → delete video  

- **Integration**:
  - Directly consumed by UI components (e.g. `ComponentWorkshop`, `CLogicWorkshop`, `ComponentVideoSearch`)  

---

### **frontend/js/api/types.gen.ts**
- **Purpose**: Generated TypeScript types shared across schemas and services  
- **Usage**:
  - Defines entities like `Questionnaire`, `Question`, `Category`, `Video`  
  - Ensures compile-time safety when consuming API results  
  - Used in React props and state to enforce correct data structures  

---
