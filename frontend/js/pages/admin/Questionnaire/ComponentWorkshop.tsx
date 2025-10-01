import { useEffect, FC } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder";
import { QuestionnairebuilderService } from "../../../api/services.gen";

const ComponentWorkshop: FC<QuestionnaireStates> = ({
    questionnaires, setQuestionnaires,
    questionnaireWorkshop, setQuestionnaireWorkshop,
    currentQuestionnaire, setCurrentQuestionnaire,
    setQuestionForms, setQuestionIsSelected
}) => {

    const removeFromQuestionnaire = (index: number) => {
        const updatedQuestions = [...currentQuestionnaire.questions];
        updatedQuestions.splice(index, 1);
        setCurrentQuestionnaire({ ...currentQuestionnaire, questions: updatedQuestions });
    };

    const createQuestionnaireButton = () => {
        const requestData = {
            id: 0,
            title: currentQuestionnaire.title,
            status: currentQuestionnaire.status,
            questions: currentQuestionnaire.questions.map(q => q.id)
        };
        QuestionnairebuilderService.questionnairebuilderCreatequestionnaireCreate({ requestBody: requestData })
            .then(response => {
                setQuestionnaires([...questionnaires, { ...currentQuestionnaire, id: response.id }]);
                setQuestionnaireWorkshop("");
                clearForms();
            })
            .catch(error => {
                console.error(error);
                alert("Failed to create questionnaire");
            });
    };

    const modifyQuestionnaireButton = () => {
        const requestData = {
            id: currentQuestionnaire.id,
            title: currentQuestionnaire.title,
            status: currentQuestionnaire.status,
            questions: currentQuestionnaire.questions.map(q => q.id)
        };
        QuestionnairebuilderService.questionnairebuilderCreatequestionnaireCreate({ requestBody: requestData })
            .then(response => {
                const temp = [...questionnaires];
                const idx = temp.findIndex(q => q.id === currentQuestionnaire.id);
                temp[idx] = { ...currentQuestionnaire, id: response.id };
                setQuestionnaires(temp);
                setQuestionnaireWorkshop("");
                clearForms();
            })
            .catch(error => {
                console.error(error);
                alert("Failed to update questionnaire");
            });
    };

    const cancelQuestionnaireButton = () => {
        setQuestionnaireWorkshop("");
        clearForms();
    };

    const deleteQuestionnaireButton = (questionnaire_id: number) => {
        if (!confirm("Are you sure you want to delete this questionnaire?")) return;
        QuestionnairebuilderService.questionnairebuilderDeletequestionnaireDestroy({ id: questionnaire_id })
            .then(() => setQuestionnaires(questionnaires.filter(q => q.id !== questionnaire_id)))
            .catch(error => console.log(error));
    };

    function clearForms() {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: [] });
        setQuestionIsSelected(false);
        setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{ id: 0, text: "" }, { id: 0, text: "" }] });
    }

    return (
        <div className="workshop-container">
            <div className="header-row">
                <h3>{questionnaireWorkshop === "new" ? "Create New Questionnaire" : "Modify Questionnaire"}</h3>
            </div>

            {/* Questionnaire Title */}
            <div className="form-row">
                <label>Questionnaire Name:</label>
                <input
                    type="text"
                    value={currentQuestionnaire.title}
                    onChange={e => setCurrentQuestionnaire({ ...currentQuestionnaire, title: e.target.value })}
                    className="form-input"
                />
            </div>

            {/* Status Selection */}
            <div className="form-row">
                <label>Status:</label>
                <div className="status-buttons">
                    {["Publish", "Create New Draft", "Create Template"].map(status => (
                        <button
                            key={status}
                            className={`btn-status ${currentQuestionnaire.status === status ? "selected" : ""}`}
                            onClick={() => setCurrentQuestionnaire({ ...currentQuestionnaire, status })}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Grid */}
            <div className="questions-grid">
                {currentQuestionnaire.questions.map((q, idx) => (
                    <div key={idx} className="question-card">
                        <p><strong>Question:</strong> {q.text}</p>
                        <p><strong>Type:</strong> {q.type}</p>
                        <button className="btn-remove" onClick={() => removeFromQuestionnaire(idx)}>Remove</button>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="action-row">
                {questionnaireWorkshop === "new" ? (
                    <>
                        <button className="btn-primary" onClick={createQuestionnaireButton}>Create Questionnaire</button>
                        <button className="btn-cancel" onClick={cancelQuestionnaireButton}>Cancel</button>
                    </>
                ) : (
                    <>
                        <button className="btn-primary" onClick={modifyQuestionnaireButton}>Update Questionnaire</button>
                        <button className="btn-cancel" onClick={cancelQuestionnaireButton}>Cancel</button>
                        <button className="btn-delete" onClick={() => deleteQuestionnaireButton(currentQuestionnaire.id)}>Delete</button>
                    </>
                )}
            </div>

            <style>{`
                .workshop-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    max-width: 850px;
                    padding: 12px;
                }
                .header-row { display: flex; justify-content: space-between; align-items: center; }
                .form-row { display: flex; align-items: center; gap: 12px; }
                .form-input { flex: 1; padding: 6px 8px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; }
                .status-buttons { display: flex; gap: 8px; white-space: nowrap; }
                .btn-status { flex: 1; padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc; background-color: #f1f1f1; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-size: 12px; }
                .btn-status.selected { background-color: #007bff; color: white; border-color: #007bff; }
                .questions-grid { display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 12px; }
                .question-card { background-color: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #ccc; display: flex; flex-direction: column; gap: 8px; }
                
                .btn-primary, .btn-cancel, .btn-delete {
                    cursor: pointer;
                    border-radius: 4px;
                    border: none;
                    padding: 8px 16px;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }
                .btn-primary { background-color: #007bff; color: white; }
                .btn-cancel { background-color: #6c757d; color: white; }
                .btn-delete { background-color: #dc3545; color: white; }

                .btn-remove {
                    cursor: pointer;
                    border-radius: 4px;
                    border: none;
                    padding: 4px 8px;
                    font-size: 12px;
                    background-color: #dc3545;
                    color: white;
                    transition: all 0.2s ease;
                }

                .btn-primary:hover, .btn-cancel:hover, .btn-delete:hover, .btn-remove:hover { opacity: 0.85; }
                .action-row { display: flex; gap: 12px; }
            `}</style>
        </div>
    );
}

export default ComponentWorkshop;