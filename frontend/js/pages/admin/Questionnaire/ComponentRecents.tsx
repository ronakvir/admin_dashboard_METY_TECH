import { Dispatch, FC, SetStateAction, useEffect} from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnaireFull } from "../../../api/types.gen";
import { QuestionnaireService } from "../../../api/services.gen";




const ComponentRecents: FC<QuestionnaireStates> = ({ 
    questionnaires,             setQuestionnaires,
    questions,                  setQuestions,
    questionnaireVisibility,    setQuestionnaireVisibility, 
    questionnaireList,          setQuestionnaireList,
    questionType,               setQuestionType,
    questionForms,              setQuestionForms,
    questionnaireWorkshop,      setQuestionnaireWorkshop,
    currentQuestionnaire,       setCurrentQuestionnaire, 
    questionIsSelected,         setQuestionIsSelected,
    recentQuestionnaires,       setRecentQuestionnaires,
    previewQuestionnaire,       setPreviewQuestionnaire}) => {

    
    
    useEffect(() => {
        updateRecentsList();
        console.log("recents");
    }, [questionnaires])


    const updateRecentsList = () => {
        let count = 0;
        const tempRecentQuestionnaires: QuestionnaireFull[] = [];
        while (count < 4) {
            let topQuestionnaire: QuestionnaireFull = { id: 0, title: "", status: "", started: 0, completed: 0, last_modified: "", questions: []};
            let mostRecentDate: Date = new Date("1900-01-01T00:00:00.000");
            questionnaires.forEach( (questionnaire, index) => {
                let date = new Date(questionnaire.last_modified);
                if (date > mostRecentDate) {
                    if (!tempRecentQuestionnaires.includes(questionnaire)){

                        mostRecentDate = date;
                        topQuestionnaire = questionnaire;
                        
                    }
                }
    
            })
            console.log("TEST " + topQuestionnaire.title);
            console.log("TEST " + topQuestionnaire.id);
            count++;
            if (topQuestionnaire.id != 0) tempRecentQuestionnaires.push(topQuestionnaire);
            
            
        }
        setRecentQuestionnaires(tempRecentQuestionnaires);
    }

    const editQuestionnaireButton = (questionnaire: QuestionnaireFull) => {
        setQuestionnaireWorkshop("modify");
        setCurrentQuestionnaire(questionnaire);
    }

    const previewQuestionnaireButton = (questionnaire: QuestionnaireFull) => {
        setCurrentQuestionnaire(questionnaire);
        setPreviewQuestionnaire(true)
    }

    const deleteQuestionnaireButton = (questionnaire_id: number) => {
        if(!confirm("Are you sure you would like to delete this questionnaire? This action cannot be reversed.")) return;
        QuestionnaireService.deleteQuestionnaire(questionnaire_id)
            .then( response => {
               

                let index = questionnaires.findIndex( questionnaire => questionnaire_id === questionnaire.id );
                
                console.log("Index: " + index);
                console.log("Length: " + questionnaires.length);
                const tempQuestionnaires = [ ...questionnaires ];
                tempQuestionnaires.splice(index, 1);
                setQuestionnaires(tempQuestionnaires);
            })
            .catch( error => console.log(error) )
    }

    // The Questionnaire Cards
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <h4 style={{display: "flex", justifyContent: "left"}}>Recent Questionnaires</h4>
            <div style={{display: "flex", flexDirection: "row"}}>
                { (() => {
                    return recentQuestionnaires.map((questionnaire, index) => {
                        return  (
                            <div style={{width: "200px", height: "225px", backgroundColor: "lightgrey", borderRadius: "15px", overflow: "hidden", margin: "5px", padding: "10px"}}>
                                <h3>{questionnaire.title}</h3>
                                <p>{questionnaire.questions.length} questions - {questionnaire.status} - {questionnaire.completed} responses</p>
                                <button style={{borderRadius: "10px", justifyContent: "left"}} onClick={ () => editQuestionnaireButton(questionnaire) }>
                                    Edit
                                </button>
                                <button style={{borderRadius: "10px", justifyContent: "left"}} onClick={ () => previewQuestionnaireButton(questionnaire)} >
                                    Preview
                                </button>
                                <button style={{borderRadius: "10px", justifyContent: "left", backgroundColor: "lightcoral", color: "black"}} onClick={ () => deleteQuestionnaireButton(questionnaire.id)} >
                                    Delete
                                </button>
                            </div>
                        );
                    })
                })()}

            </div>
        </div>
    )
    
}
export default ComponentRecents;