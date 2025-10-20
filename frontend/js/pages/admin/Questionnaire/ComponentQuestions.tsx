import { useEffect, FC } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder";
import { QuestionnairebuilderService } from "../../../api/services.gen";

// Global variable to track each type’s question count
let questionCount = [0, 0, 0, 0];

const ComponentQuestions: FC<QuestionnaireStates> = ({
  questionnaires,
  setQuestionnaires,
  questions,
  setQuestions,
  questionnaireWorkshop,
  setQuestionType,
  questionType,
  questionForms,
  setQuestionForms,
  questionIsSelected,
  setQuestionIsSelected,
  currentQuestionnaire,
  setCurrentQuestionnaire,
  questionnaireVisibility,
  setQuestionnaireVisibility,
  questionnaireList,
  setQuestionnaireList,
  previewQuestionnaire,
  setPreviewQuestionnaire,
    currentPreviewIndex, setCurrentPreviewIndex
}) => {

  // Updates answers in form
  const addAnswerField = (index: number, value: string) => {
    const newAnswers = [...questionForms.answers];
    newAnswers[index].text = value;
    newAnswers[index].id = 0;
    setQuestionForms({ ...questionForms, answers: newAnswers });
  };

  // Removes an answer field
  const removeAnswerField = (index: number) => {
    if (questionForms.answers.length < 3) return;
    const updatedAnswers = [...questionForms.answers];
    updatedAnswers.splice(index, 1);
    setQuestionForms({ ...questionForms, answers: updatedAnswers });
  };

  // Select a question from the list
  const selectQuestion = (question: { id: number; type: string; text: string; answers: { id: number; text: string }[] }) => {
    if (questionForms.id === question.id) setQuestionIsSelected(false);
    else setQuestionIsSelected(true);

    setQuestionForms(
      questionForms.id === question.id
        ? { id: 0, type: questionType, text: "", answers: [{ id: 0, text: "" }, { id: 0, text: "" }] }
        : question
    );
  };

  // Adds a new question
  const addQuestion = () => {
    if (questionForms.text.trim() === "") {
      alert("You must enter a question first!");
      return;
    }
    QuestionnairebuilderService.questionnairebuilderAddquestionCreate({ requestBody: questionForms })
      .then((response) => {
        setQuestions([...questions, response]);
        clearForms();
      })
      .catch((error) => console.log(error));
  };

  // Modify existing question
  const modifyQuestion = () => {
    if (questionForms.text.trim() === "") {
      alert("You must enter a question first!");
      return;
    }
    QuestionnairebuilderService.questionnairebuilderAddquestionCreate({ requestBody: questionForms })
      .then((response) => {
        const updatedQuestions = [...questions];
        const index = updatedQuestions.findIndex((q) => q.id === response.id);
        if (index !== -1) updatedQuestions[index] = response;
        setQuestions(updatedQuestions);
        clearForms();
      })
      .catch((error) => console.log(error));
  };

  // Delete a question
  const deleteQuestion = () => {
    QuestionnairebuilderService.questionnairebuilderDeletequestionDestroy({ id: questionForms.id })
      .then(() => {
        setQuestions(questions.filter((q) => q.id !== questionForms.id));
        clearForms();
      })
      .catch((error) => console.log(error));
  };

  // Add question to current questionnaire
  const addToQuestionnaire = () => {
    if (!questionIsSelected) return;
    setCurrentQuestionnaire({ ...currentQuestionnaire, questions: [...currentQuestionnaire.questions, questionForms] });
    setQuestionIsSelected(false);
    setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{ id: 0, text: "" }, { id: 0, text: "" }] });
  };

  // Clear all forms
  const clearForms = () => {
    setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: [] });
    setQuestionIsSelected(false);
    setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{ id: 0, text: "" }, { id: 0, text: "" }] });
  };

  // Count questions by type
  useEffect(() => {
    questionCount = [0, 0, 0, 0];
    questionnaires.forEach((questionnaire) => {
      questionnaire.questions.forEach((question) => {
        switch (question.type) {
          case "multichoice": questionCount[0]++; break;
          case "checkbox": questionCount[1]++; break;
          case "slider": questionCount[2]++; break;
          case "text": questionCount[3]++; break;
        }
      });
    });
  });

  // Render the question forms
  const addQuestionForms = () => {
    if (!questionType) return null;
    return (
      <div className="question-form-grid">
        {/* Left: Question Form */}
        <div className="form-column">
          <input type="text" placeholder="Question" value={questionForms.text} onChange={(e) => setQuestionForms({ ...questionForms, text: e.target.value })} className="form-input" />
          {(questionType === "checkbox" || questionType === "multichoice") &&
            questionForms.answers.map((answer, index) => (
              <div className="answer-row" key={index}>
                <input type="text" value={answer.text} placeholder="Answer" className="form-input" onChange={(e) => addAnswerField(index, e.target.value)} />
                <button className="btn-delete-small" onClick={() => removeAnswerField(index)}>X</button>
              </div>
            ))}
          {(questionType === "checkbox" || questionType === "multichoice") &&
            <button className="btn-add-category" onClick={() => setQuestionForms({ ...questionForms, answers: [...questionForms.answers, { id: 0, text: "" }] })}>Add Answer</button>}
          <div className="form-buttons">
            {!questionIsSelected ? (
              <button className="btn-search" onClick={addQuestion}>Add Question</button>
            ) : (
              <>
                <button className="btn-search" onClick={modifyQuestion}>Modify</button>
                <button className="btn-delete-small" onClick={deleteQuestion}>Delete</button>
              </>
            )}
            <button className="btn-back" onClick={clearForms}>Cancel</button>
          </div>
        </div>

        {/* Middle: Question List */}
        <div className="form-column">
          <h5>Questions</h5>
          <div className="question-list">
            {questions.filter((q) => q.type === questionType).map((q) => (
              <div key={q.id} className={`question-row ${questionForms.id === q.id ? "selected" : ""}`} onClick={() => selectQuestion(q)}>
                {q.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="form-column">
          <h5>Preview</h5>
          <div className="question-preview">
            <h6>{questionForms.text}</h6>
            {questionType === "slider" && <input type="range" className="form-input" />}
            {questionType === "text" && <input type="text" className="form-input" />}
            {(questionType === "multichoice" || questionType === "checkbox") &&
              questionForms.answers.map((answer, i) => (
                <label key={i} className="option-row">
                  <input type={questionType === "multichoice" ? "radio" : "checkbox"} name="preview" />
                  {answer.text}
                </label>
              ))}
            {questionIsSelected && questionnaireWorkshop !== "" &&
              <button className="btn-search" onClick={addToQuestionnaire}>Add to Questionnaire</button>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="question-management">
      <h4>Question Types</h4>
      <div className="question-type-cards">
        {["Multiple Choice", "Checkbox", "Slider Scale", "Text Input"].map((name, i) => {
          const typeMap = ["multichoice", "checkbox", "slider", "text"];
          return (
            <div key={i} className={`type-card ${questionType === typeMap[i] ? "selected" : ""}`} onClick={() => setQuestionType(typeMap[i])}>
              <h5>{name}</h5>
              <p>Used in {questionCount[i]} questionnaires</p>
            </div>
          );
        })}
      </div>
      {addQuestionForms()}

      {/* Styles */}
      <style>{`
        .question-management { display: flex; flex-direction: column; gap: 16px; max-width: 1000px; }
        .question-type-cards { display: flex; gap: 12px; flex-wrap: wrap; }
        .type-card { width: 200px; background-color: white; border: 2px solid #007bff; color: black; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s ease; }
        .type-card.selected { background-color: #007bff; color: white; }
        .form-column { display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .question-form-grid { display: flex; gap: 20px; }
        .form-input { padding: 6px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; width: 100%; }
        .answer-row { display: flex; gap: 8px; align-items: center; }
        .form-buttons { display: flex; gap: 8px; }
        .btn-back, .btn-search, .btn-delete-small, .btn-add-category { border: none; border-radius: 4px; cursor: pointer; font-size: 14px; padding: 6px 12px; transition: opacity 0.2s ease; }
        .btn-back { background-color: #6c757d; color: white; }
        .btn-search { background-color: #007bff; color: white; }
        .btn-delete-small { background-color: #dc3545; color: white; }
        .btn-add-category { background-color: white; border: 2px solid #007bff; color: #007bff; }
        .btn-back:hover, .btn-search:hover, .btn-delete-small:hover, .btn-add-category:hover { opacity: 0.85; }
        .question-list { border: 1px solid #ccc; border-radius: 8px; padding: 8px; max-height: 300px; overflow-y: auto; }
        .question-row { padding: 6px; border-radius: 4px; cursor: pointer; margin-bottom: 4px; background-color: white; }
        .question-row.selected { background-color: #dee2e6; }
        .question-preview { border: 1px solid #ccc; border-radius: 8px; padding: 12px; background-color: #f8f9fa; display: flex; flex-direction: column; gap: 8px; }
        .option-row { display: flex; gap: 8px; align-items: center; }
      `}</style>
    </div>
  );
};

export default ComponentQuestions;