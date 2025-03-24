import { useEffect, FC, Dispatch, SetStateAction, useState } from "react";
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
    previewQuestionnaire:       boolean;                setPreviewQuestionnaire:    Dispatch<SetStateAction<boolean>>; 
}

let questionCount = [0, 0, 0, 0];

const ComponentPreview: FC<QuestionnaireStates> = ({ 
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


    const [tempSliderValue, setTempSliderValue] = useState(50);
    const returnToDashboard = () => {
        setCurrentQuestionnaire({ id: "", name: "", status: "", responses: "", lastModified: "", questions: []});
        setPreviewQuestionnaire(false);
    }
    return (
        <>
            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <button style={{width: "415px"}} onClick={() => returnToDashboard()}> Return to Dashboard</button>
                <h4>{currentQuestionnaire.name}</h4>
                <div style={{display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: "10px", width: "830px"}}>
                    { (() => {
                    return currentQuestionnaire.questions.map((id, index) => {
                        let question = questions.get(id);
                        return (
                            
                        <div style={{borderRadius: "10px", backgroundColor: "lightgrey", padding: "20px", aspectRatio: "1", justifyContent: "flex-start", alignItems: "flex-start", display: "flex", flexDirection: "column", border: "1px solid black"}}>
                            <h5>{question?.question}</h5>
                            { (() => {
                                let type = question?.type;
                                if (type === "slider") {
                                    return <input type="range" style={{width: "100%", padding: "20px", }} onChange={(value) => setTempSliderValue(Number(value.target.value))}/>;
                                }
                                else if (type === "text") {
                                    return <input style={{height: "auto", width: "100%", padding: "5px 10px", }}></input>;
                                }
                                else {
                                    return question?.answers.map((answer, index) => {
                                        if (type === "multichoice") {
                                            return (
                                                <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                                    <input type="radio" name={question?.question} value={answer} />
                                                    <label htmlFor={question?.question}>{answer}</label>
                                                </div>
                                            )
                                     
                                        }
                                        else if (type === "checkbox") {
                                            return (
                                                <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                                    <input type="checkbox" name={question?.question} value={answer} />
                                                    <label htmlFor={question?.question}>{answer}</label>
                                                </div>
                                            )
                                     
                                        }
                                    })
                                }
                            })()}
                        </div>

                    )})
                    })()}
                </div>
            </div>
        </>
    )
}

export default ComponentPreview;