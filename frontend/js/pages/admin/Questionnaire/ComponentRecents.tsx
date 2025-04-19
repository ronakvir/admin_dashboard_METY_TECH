import { Dispatch, FC, SetStateAction, useEffect} from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnaireFull } from "../../../api/types.gen";




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

    const editQuestionnaire = (questionnaire: QuestionnaireFull) => {
        setQuestionnaireWorkshop("modify");
        setCurrentQuestionnaire(questionnaire);
    }

    const previewQuestionnaireButton = (questionnaire: QuestionnaireFull) => {
        setCurrentQuestionnaire(questionnaire);
        setPreviewQuestionnaire(true)
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
                            <button onClick={ () => editQuestionnaire(questionnaire) }>
                                Edit
                            </button>
                            <button onClick={ () => previewQuestionnaireButton(questionnaire)} >
                                Preview
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