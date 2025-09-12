import React, { useEffect } from "react";
import { LogicbuilderService } from "../../../api/services.gen";
import { QuestionLogicPage } from "../../../api/types.gen";
import { LogicBuilderStates } from "./LogicBuilder";
import CLogicWorkshop from "./CLogicWorkshop";

const CQuestionnaireSelection: React.FC<LogicBuilderStates> = ({
  questionnaireList, setQuestionnaireList,
  categoryList, setCategoryList,
  questionList, setQuestionList,
  selectedLink, setSelectedLink,
  linkWorkshop, setLinkWorkshop,
  selectedQuestionnaire, setSelectedQuestionnaire,
  expandedQuestions, setExpandedQuestions
}) => {

  function clearStates() {
    setQuestionList([]);
    setExpandedQuestions([]);
    setSelectedLink({
      id: 0,
      text: "",
      answer: { id: 0, text: "", categories: [{ id: 0, text: "", inclusive: true }] }
    });
    setLinkWorkshop(false);
  }

  // Reset everything when navigating away (unmount)
  useEffect(() => {
    return () => {
      setSelectedQuestionnaire({ id: 0, title: "" });
      clearStates();
    };
  }, []);

  const selectQuestionnaire = async (questionnaireID: number) => {
    clearStates();

    if (questionnaireID === 0) {
      setSelectedQuestionnaire({ id: 0, title: "" });
      return;
    }

    const found = questionnaireList.find((q) => q.id === questionnaireID);
    if (found) setSelectedQuestionnaire(found);

    try {
      const questions = await LogicbuilderService.logicbuilderGetquestionsRetrieve({ questionnaireId: questionnaireID });
      setQuestionList(questions || []);
      setExpandedQuestions(Array((questions || []).length).fill(false));
    } catch (err) {
      console.log(err);
    }

    try {
      const cats = await LogicbuilderService.logicbuilderGetcategoriesRetrieve();
      setCategoryList(cats || []);
    } catch (err) {
      console.log(err);
    }
  };

  const hasSelected = selectedQuestionnaire && selectedQuestionnaire.id !== 0;
  const hasQuestions = hasSelected && questionList.length > 0;

return (
  <div className="questionnaire-selection">
    <h2>Questionnaire Configuration</h2>

    {linkWorkshop ? (
      // When editing, render workshop instead of list/preview
      <CLogicWorkshop
        questionnaireList={questionnaireList} setQuestionnaireList={setQuestionnaireList}
        categoryList={categoryList} setCategoryList={setCategoryList}
        questionList={questionList} setQuestionList={setQuestionList}
        selectedLink={selectedLink} setSelectedLink={setSelectedLink}
        linkWorkshop={linkWorkshop} setLinkWorkshop={setLinkWorkshop}
        selectedQuestionnaire={selectedQuestionnaire} setSelectedQuestionnaire={setSelectedQuestionnaire}
        expandedQuestions={expandedQuestions} setExpandedQuestions={setExpandedQuestions}
      />
    ) : (
      // Otherwise show list + preview
      <div className="layout">
        {/* Left: scrollable list */}
        <div className="questionnaire-section">
          <h3>Available Questionnaires</h3>
          {questionnaireList.length === 0 ? (
            <p>No questionnaires available</p>
          ) : (
            <div className="questionnaire-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {questionnaireList.map((q) => (
                    <tr
                      key={q.id}
                      className={selectedQuestionnaire?.id === q.id ? "active" : ""}
                      onClick={() => selectQuestionnaire(q.id)}
                    >
                      <td>{q.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: preview table */}
        <div className="content-section">
          {!hasSelected ? (
            <p className="placeholder">Please select a questionnaire</p>
          ) : !hasQuestions ? (
            <>
              <h3 className="questionnaire-title">{selectedQuestionnaire.title}</h3>
              <div className="questionnaire-header">
                <button className="btn-edit" onClick={() => setLinkWorkshop(true)}>
                  Edit Questionnaire
                </button>
              </div>
              <p className="placeholder">This questionnaire has no questions</p>
            </>
          ) : (
            <>
              <h3 className="questionnaire-title">{selectedQuestionnaire.title}</h3>
              <div className="questionnaire-header">
                <button className="btn-edit" onClick={() => setLinkWorkshop(true)}>
                  Edit Questionnaire
                </button>
              </div>
              <table className="questionnaire-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Mapped Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((question: QuestionLogicPage, idx: number) => {
                    const totalResponses = question.answers.length;
                    const mappedResponses = question.answers.filter(
                      (answer) => answer.categories.length > 0
                    ).length;

                    return (
                      <tr key={idx}>
                        <td>{question.text}</td>
                        <td>
                          {mappedResponses}/{totalResponses}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    )}

    <style>{`
      .questionnaire-selection {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }
      .layout {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }
      .questionnaire-section {
        width: 250px;
        flex-shrink: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
      }
      .questionnaire-section h3 {
        margin: 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #ddd;
      }
      .questionnaire-table {
        max-height: calc(2.5em * 10);
        overflow-y: auto;
      }
      .questionnaire-table table {
        width: 100%;
        border-collapse: collapse;
      }
      .questionnaire-table th,
      .questionnaire-table td {
        padding: 0 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
        height: 2.5em;
        line-height: 1.2em;
      }
      .questionnaire-table th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      .questionnaire-table tr {
        cursor: pointer;
        transition: background 0.2s;
      }
      .questionnaire-table tr:hover {
        background-color: #f1f1f1;
      }
      .questionnaire-table tr.active {
        background-color: #007bff;
        color: white;
        font-weight: bold;
      }
      .content-section {
        flex: 1;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
      }
      .questionnaire-header {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 12px;
      }
      .questionnaire-title {
        margin: 0 0 8px 0;
      }
      .btn-edit {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-edit:hover {
        opacity: 0.85;
      }
      .placeholder {
        padding: 20px;
        font-style: italic;
        color: #666;
      }
    `}</style>
  </div>
);

};

export default CQuestionnaireSelection;
