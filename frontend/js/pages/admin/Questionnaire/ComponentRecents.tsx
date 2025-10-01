import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder";
import { QuestionnaireFull } from "../../../api/types.gen";
import { QuestionnairebuilderService } from "../../../api/services.gen";

const ComponentRecents: FC<QuestionnaireStates> = ({
    questionnaires, setQuestionnaires,
    recentQuestionnaires, setRecentQuestionnaires,
    setCurrentQuestionnaire, setPreviewQuestionnaire,
    setQuestionnaireWorkshop
}) => {

    useEffect(() => {
        updateRecentsList();
    }, [questionnaires]);

    const updateRecentsList = () => {
        let tempRecent: QuestionnaireFull[] = [];
        const sorted = [...questionnaires].sort((a, b) => 
            new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime()
        );
        tempRecent = sorted.slice(0, 4);
        setRecentQuestionnaires(tempRecent);
    }

    const editQuestionnaireButton = (questionnaire: QuestionnaireFull) => {
        setQuestionnaireWorkshop("modify");
        setCurrentQuestionnaire(questionnaire);
    }

    const previewQuestionnaireButton = (questionnaire: QuestionnaireFull) => {
        setCurrentQuestionnaire(questionnaire);
        setPreviewQuestionnaire(true);
    }

    const deleteQuestionnaireButton = (questionnaire_id: number) => {
        if (!confirm("Are you sure you want to delete this questionnaire?")) return;

        QuestionnairebuilderService.questionnairebuilderDeletequestionnaireDestroy({ id: questionnaire_id })
            .then(() => {
                setQuestionnaires(prev => prev.filter(q => q.id !== questionnaire_id));
            })
            .catch(error => console.log(error));
    }

    return (
        <div className="recents-container">
            <h4>Recent Questionnaires</h4>
            <div className="recents-grid">
                {recentQuestionnaires.map(q => (
                    <div key={q.id} className="recent-card">
                        <h5>{q.title}</h5>
                        <p>{q.questions.length} questions • {q.status} • {q.completed} responses</p>
                        <div className="card-buttons">
                            <button className="btn-edit-small" onClick={() => editQuestionnaireButton(q)}>Edit</button>
                            <button className="btn-edit-small" onClick={() => previewQuestionnaireButton(q)}>Preview</button>
                            <button className="btn-delete-small" onClick={() => deleteQuestionnaireButton(q.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .recents-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .recents-container h4 {
                    margin: 0;
                }
                .recents-grid {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .recent-card {
                    background-color: #f8f9fa;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    padding: 16px;
                    width: 200px;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .recent-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .recent-card h5 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                    white-space: normal;
                    overflow: visible;
                    text-overflow: clip;
                }
                .recent-card p {
                    font-size: 14px;
                    color: #555;
                    margin: 0 0 12px 0;
                }
                .card-buttons {
                    display: flex;
                    gap: 6px;
                    flex-wrap: nowrap;
                    justify-content: flex-start;
                }
                .btn-edit-small, .btn-delete-small {
                    border: none;
                    box-sizing: border-box;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    padding: 4px 8px;
                }
                .btn-edit-small {
                    background-color: #007bff;
                    color: white;
                }
                .btn-delete-small {
                    background-color: #dc3545;
                    color: white;
                }
                .btn-edit-small:hover, .btn-delete-small:hover {
                    opacity: 0.85;
                }
            `}</style>
        </div>
    );
}

export default ComponentRecents;