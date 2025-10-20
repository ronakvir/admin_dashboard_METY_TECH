import { useEffect, FC, Dispatch, SetStateAction, useState } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { Questionnaire, QuestionnaireFull } from "../../../api/types.gen";
import { QuestionnairebuilderService } from "../../../api/services.gen";


const ComponentList: FC<QuestionnaireStates> = ({ 
    questionnaires,             setQuestionnaires,
    questions,                  setQuestions,
    questionnaireVisibility,    setQuestionnaireVisibility, 
    questionnaireList,          setQuestionnaireList,
    questionType,               setQuestionType,
    questionForms,              setQuestionForms,
    questionnaireWorkshop,      setQuestionnaireWorkshop,
    currentQuestionnaire,       setCurrentQuestionnaire, 
    questionIsSelected,         setQuestionIsSelected,
    previewQuestionnaire,       setPreviewQuestionnaire,
    currentPreviewIndex, setCurrentPreviewIndex}) => {

    const [filter, setFilter] = useState(new RegExp(`.*`));
    
    // Updates the filterable list of questionnaires depending on which button they click
    useEffect(() => {
        console.log("Triggering Use Effect");
        console.log(JSON.stringify(questionnaires));
        let tempQuestionnaires:QuestionnaireFull[] = [];
        for (let i = 0; i < questionnaires.length; i++) {
            if (questionnaires[i].status === questionnaireVisibility || questionnaireVisibility === "All") {
                tempQuestionnaires.push(questionnaires[i]);
            }
        }
        setQuestionnaireList(tempQuestionnaires);
    },[questionnaireVisibility, questionnaires]);


    // Update the questionnaire form fields when we open the workshop view.
    useEffect(() => {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setQuestionType("multichoice");
    },[questionnaireWorkshop]);
    
    const editQuestionnaire = (questionnaire: QuestionnaireFull) => {
        setQuestionnaireWorkshop("modify");
        setCurrentQuestionnaire(questionnaire);
    }

    const previewQuestionnaireButton = (questionnaire: QuestionnaireFull) => {
        setCurrentQuestionnaire(questionnaire);
        setPreviewQuestionnaire(true)
    }

    const deleteQuestionnaireButton = (questionnaire_id: number) => {
        if(!confirm("Are you sure you would like to delete this questionnaire? This action cannot be reversed.")) return;
        QuestionnairebuilderService.questionnairebuilderDeletequestionnaireDestroy({ id: questionnaire_id })
            .then( response => {
                let index = questionnaires.findIndex( questionnaire => questionnaire_id === questionnaire.id );
                
                const tempQuestionnaires = [ ...questionnaires ];
                tempQuestionnaires.splice(index, 1);
                setQuestionnaires(tempQuestionnaires);
            })
            .catch( error => console.log(error) )
    }

    //let count = 0;
    return (
  <div className="questionnaire-management">
    {/* Toolbar */}
    <div
      className="toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
      }}
    >
      <button onClick={() => setQuestionnaireVisibility("All")} className="btn-filter">All</button>
      <button onClick={() => setQuestionnaireVisibility("Published")} className="btn-filter">Published</button>
      <button onClick={() => setQuestionnaireVisibility("Draft")} className="btn-filter">Drafts</button>
      <button onClick={() => setQuestionnaireVisibility("Template")} className="btn-filter">Templates</button>

      <label style={{ marginLeft: "12px" }}>Filter</label>
      <input
        className="form-input"
        onChange={(value) =>
          setFilter(new RegExp(`.*${value.target.value.toLowerCase()}.*`))
        }
        placeholder="Search by title..."
      />
      <button
        className="btn-search"
        onClick={() => setQuestionnaireWorkshop("new")}
      >
        Create New
      </button>
    </div>

    {/* Header */}
    <h4 style={{ margin: "8px 0" }}>{questionnaireVisibility} Questionnaires</h4>

    {/* Scrollable List */}
    <div className="questionnaire-list">
      {questionnaireList.map((questionnaire: QuestionnaireFull) => {
        if (!filter.test(questionnaire.title.toLowerCase())) return null;

        return (
          <div key={questionnaire.id} className="questionnaire-row">
            <span className="cell title">{questionnaire.title}</span>
            <span className="cell">{questionnaire.questions.length} questions</span>
            <span className="cell">{questionnaire.status}</span>
            <span className="cell">{questionnaire.completed} responses</span>
            <div className="actions">
              <button
                className="btn-edit-small"
                onClick={() => editQuestionnaire(questionnaire)}
              >
                Edit
              </button>
              <button
                className="btn-search"
                onClick={() => previewQuestionnaireButton(questionnaire)}
              >
                Preview
              </button>
              <button
                className="btn-delete-small"
                onClick={() => deleteQuestionnaireButton(questionnaire.id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Styles */}
    <style>{`
      .form-input {
        padding: 6px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .btn-filter, .btn-search, .btn-edit-small, .btn-delete-small {
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        padding: 6px 12px;
      }

      .btn-filter {
        background-color: #f1f1f1;
        border: 1px solid #ccc;
      }
      .btn-filter:hover {
        background-color: #e2e6ea;
      }

      .btn-search {
        background-color: #007bff;
        whitespace: nowrap;
        padding: 6px 16px;
        text-align: center;
        color: white;
      }
      .btn-edit-small {
        background-color: #6c757d;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
      }
      .btn-delete-small {
        background-color: #dc3545;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
        border: 2px solid #dc3545;
      }

      .btn-search:hover, .btn-edit-small:hover, .btn-delete-small:hover {
        opacity: 0.85;
      }

      .questionnaire-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 400px;
        overflow-y: auto;
        padding-right: 6px;
      }

      .questionnaire-row {
        display: flex;
        align-items: center;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: #fafafa;
        transition: background 0.2s ease;
      }

      .questionnaire-row:hover {
        background: #f1f1f1;
      }

      .cell {
        flex: 1;
        font-size: 14px;
        margin-right: 12px;
      }

      .cell.title {
        font-weight: bold;
        min-width: 200px;
      }

      .actions {
        display: flex;
        gap: 6px;
      }
    `}</style>
  </div>
);

}
export default ComponentList;
