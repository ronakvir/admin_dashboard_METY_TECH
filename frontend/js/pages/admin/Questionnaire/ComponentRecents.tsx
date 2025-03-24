import { Dispatch, FC, SetStateAction} from "react";
import { Questionnaire, Question } from "./QuestionnaireBuilder"

interface QuestionnaireStates {
    questionnaires:             Questionnaire[];        setQuestionnaires:          Dispatch<SetStateAction<Questionnaire[]>>;
    questions:                  Map<string, Question>;  setQuestions:               Dispatch<SetStateAction<Map<string, Question>>>;
    questionnaireVisibility:    string;                 setQuestionnaireVisibility: Dispatch<SetStateAction<string>>;
    questionnaireList:          Questionnaire[];        setQuestionnaireList:       Dispatch<SetStateAction<Questionnaire[]>>;
    questionType:               string;                 setQuestionType:            Dispatch<SetStateAction<string>>; 
    questionForms:              Question;               setQuestionForms:           Dispatch<SetStateAction<Question>>;
    questionnaireWorkshop:      string;                 setQuestionnaireWorkshop:   Dispatch<SetStateAction<string>>;
    currentQuestionnaire:       Questionnaire;          setCurrentQuestionnaire:    Dispatch<SetStateAction<Questionnaire>>;
    questionIsSelected:         boolean;                setQuestionIsSelected:      Dispatch<SetStateAction<boolean>>;
    previewQuestionnaire:       boolean;            setPreviewQuestionnaire:    Dispatch<SetStateAction<boolean>>; 
}



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
    previewQuestionnaire,       setPreviewQuestionnaire}) => {
    let count = 0;
    let recentQuestionnaires: Questionnaire[] = [];
    while (count < 4) {
        let topQuestionnaire: Questionnaire = {id: "", name: "", status: "", responses: "", lastModified: "1900-01-01", questions: []};
        let mostRecentDate: Date = new Date("1900-01-01");
        questionnaires.forEach( (questionnaire, index) => {
            let date = new Date(questionnaire.lastModified);
            if (date > mostRecentDate) {
                if (!recentQuestionnaires.includes(questionnaire)){
                    mostRecentDate = date;
                    topQuestionnaire = questionnaire;
                }
            }

        })
        count++;
        recentQuestionnaires.push(topQuestionnaire);
    }

    const editQuestionnaire = (questionnaire: Questionnaire) => {
        setQuestionnaireWorkshop("modify");
        setCurrentQuestionnaire(questionnaire);
    }

    const previewQuestionnaireButton = (questionnaire: Questionnaire) => {
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
                            <h3>{questionnaire.name}</h3>
                            <p>{questionnaire.questions.length} questions - {questionnaire.status} - {questionnaire.responses} responses</p>
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