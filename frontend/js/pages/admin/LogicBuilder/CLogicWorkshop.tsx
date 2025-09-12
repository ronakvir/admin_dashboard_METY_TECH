import React, { useState } from "react";
import { AnswerLogicPage, QuestionLogicPage } from "../../../api/types.gen";
import { LogicbuilderService } from "../../../api/services.gen";
import { LogicBuilderStates } from "./LogicBuilder";

const CLogicWorkshop: React.FC<LogicBuilderStates> = ({

  categoryList, setCategoryList,
  questionList, setQuestionList,
  selectedLink, setSelectedLink,
  linkWorkshop, setLinkWorkshop,
  selectedQuestionnaire, setSelectedQuestionnaire,
  expandedQuestions, setExpandedQuestions
}) => {
  const [checkedInclusive, setCheckedInclusive] = useState(true);

  const toggleExpand = (idx: number) => {
    const copy = [...expandedQuestions];
    copy[idx] = !copy[idx];
    setExpandedQuestions(copy);
  };

  const handleEdit = (q: QuestionLogicPage, a: AnswerLogicPage) => {
    setSelectedLink({ id: q.id, text: q.text, answer: a });
  };

  const handleDelete = async (answerId: number) => {
    if (!confirm("Are you sure you want to delete the links for this response?")) return;
    try {
      await LogicbuilderService.logicbuilderDeletemappingDestroy({
        questionnaireId: selectedQuestionnaire.id,
        answerId,
      });
      const updated = [...questionList];
      updated.forEach((q) =>
        q.answers.forEach((a) => {
          if (a.id === answerId) {
            a.categories = [];
          }
        })
      );
      setQuestionList(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const addLink = async (e: React.MouseEvent<HTMLButtonElement>, answerID: number) => {
    e.preventDefault();
    const categorySelection = document.getElementById("categories") as HTMLSelectElement;
    const categoryID = parseInt(categorySelection.value);
    if (!categoryID) return;

    const mappingData = {
      questionnaire_id: selectedQuestionnaire.id,
      answer_id: answerID,
      category_id: categoryID,
      inclusive: checkedInclusive,
    };

    try {
      await LogicbuilderService.logicbuilderAddmappingCreate({ requestBody: mappingData });

      const tempQuestionList = [...questionList];
      tempQuestionList.forEach((q) =>
        q.answers.forEach((a) => {
          if (a.id === answerID) {
            const categoryText = categoryList.find((c) => c.id === categoryID)?.text || "";
            a.categories.push({
              id: categoryID,
              text: categoryText,
              inclusive: checkedInclusive,
            });
          }
        })
      );
      setCheckedInclusive(true);
      setQuestionList(tempQuestionList);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="logic-workshop">
      {selectedLink && selectedLink.id !== 0 ? (
        // ─────────────── EDIT MODE ───────────────
        <div className="content-section">
          <div className="questionnaire-header">
            <button
              className="btn-back"
              onClick={() =>
                setSelectedLink({
                  id: 0,
                  text: "",
                  answer: { id: 0, text: "", categories: [] },
                })
              }
            >
              ← Back to Workshop
            </button>
          </div>
          <h2 className="questionnaire-title">{selectedQuestionnaire.title} — Rule Configuration</h2>

          <div className="edit-panel">
            <p><strong>Question:</strong> {selectedLink.text}</p>
            <p><strong>Response:</strong> {selectedLink.answer.text}</p>

            <h4>Linked Categories</h4>
            <div className="form-row">
              <select id="categories" className="form-select">
                <option value=""></option>
                {categoryList.map((category) => {
                  if (selectedLink.answer.categories.some((c) => c.id === category.id)) return null;
                  return (
                    <option key={category.id} value={category.id}>
                      {category.text}
                    </option>
                  );
                })}
              </select>
              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={checkedInclusive}
                  onChange={() => setCheckedInclusive(!checkedInclusive)}
                />
                Inclusive
              </label>
              <button
                className="btn-edit"
                onClick={(e) => addLink(e, selectedLink.answer.id)}
              >
                Link Category
              </button>
            </div>

            {selectedLink.answer.categories.length === 0 ? (
              <p className="placeholder">No categories linked</p>
            ) : (
              <ul className="category-list">
                {selectedLink.answer.categories.map((category, index) => (
                  <li key={category.id}>
                    {index + 1}: {category.inclusive ? "✅" : "❌"} {category.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        // ─────────────── WORKSHOP MODE ───────────────
        <div className="content-section">
          <div className="questionnaire-header">
            <button className="btn-back" onClick={() => setLinkWorkshop(false)}>
              ← Back to Questionnaire
            </button>
          </div>
          <h2 className="questionnaire-title">{selectedQuestionnaire.title} — Logic Workshop</h2>

          {questionList.length === 0 ? (
            <p className="placeholder">No questions available</p>
          ) : (
            <div className="workshop-table-container">
              <table className="workshop-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Responses</th>
                    <th>Linked Categories</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((q, qIdx) =>
                    !expandedQuestions[qIdx] ? (
                      <tr key={q.id} onClick={() => toggleExpand(qIdx)} className="collapsed-row">
                        <td>
                          <span className="toggle-icon">⮟</span>
                          {q.text}
                        </td>
                        <td colSpan={3}>
                          {q.answers.filter((a) => a.categories.length > 0).length} of{" "}
                          {q.answers.length} mapped
                        </td>
                      </tr>
                    ) : (
                      q.answers.map((a, aIdx) => (
                        <tr key={a.id} className="expanded-row">
                          {aIdx === 0 && (
                            <td rowSpan={q.answers.length} onClick={() => toggleExpand(qIdx)}>
                              <span className="toggle-icon">⮝</span>
                              {q.text}
                            </td>
                          )}
                          <td>{a.text}</td>
                          <td>{a.categories.length}</td>
                          <td className="action-buttons">
                            <button
                              className="btn-edit-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(q, a);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-delete-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(a.id);
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        .logic-workshop {
          padding: 20px;
        }
        .questionnaire-header {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 12px;
        }
        .questionnaire-title {
          margin: 0 0 12px 0;
        }
        .form-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .form-select {
          padding: 6px;
        }
        .checkbox-inline {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .category-list {
          list-style: none;
          padding: 0;
          margin: 12px 0 0 0;
        }
        .workshop-table {
          width: 100%;
          border-collapse: collapse;
        }
        .workshop-table th,
        .workshop-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          text-align: left;
          vertical-align: top;
        }
        .workshop-table th {
          background-color: #f8f9fa;
        }
        .collapsed-row {
          cursor: pointer;
          background: #fafafa;
        }
        .collapsed-row:hover {
          background: #f1f1f1;
        }
        .toggle-icon {
          margin-right: 8px;
          font-weight: bold;
        }
        .action-buttons {
          display: flex;
          gap: 6px;
        }
        .btn-back,
        .btn-edit,
        .btn-edit-small,
        .btn-delete-small {
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          padding: 6px 12px;
        }
        .btn-back {
          background-color: #6c757d;
          color: white;
        }
        .btn-edit {
          background-color: #007bff;
          color: white;
        }
        .btn-edit-small {
          background-color: #007bff;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
        }
        .btn-delete-small {
          background-color: #dc3545;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
        }
        .btn-back:hover,
        .btn-edit:hover,
        .btn-edit-small:hover,
        .btn-delete-small:hover {
          opacity: 0.85;
        }
        .placeholder {
          font-style: italic;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default CLogicWorkshop;
