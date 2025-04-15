import { useEffect, FC, Dispatch, SetStateAction, useState } from "react";
import { Questionnaire, QuestionnaireStates } from "./QuestionnaireBuilder"


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
    previewQuestionnaire,       setPreviewQuestionnaire}) => {

    const [filter, setFilter] = useState(new RegExp(`.*`));
    
    // Updates the filterable list of questionnaires depending on which button they click
    useEffect(() => {
        let tempQuestionnaires:Questionnaire[] = [];
        for (let i = 0; i < questionnaires.length; i++) {
            if (questionnaires[i].status === questionnaireVisibility || questionnaireVisibility === "All") {
                tempQuestionnaires.push(questionnaires[i]);
            }
        }
        setQuestionnaireList(tempQuestionnaires);
    },[questionnaireVisibility, questionnaires]);

     // Update the questionnaire form fields when we open the workshop view.
    useEffect(() => {
        setCurrentQuestionnaire({ id: 0, name: "", status: "", started: 0, completed: 0, lastModified: new Date().toISOString(), questions: []});
        setQuestionType("multichoice");
    },[questionnaireWorkshop]);
    
    const editQuestionnaire = (questionnaire: Questionnaire) => {
        setQuestionnaireWorkshop("modify");
        setCurrentQuestionnaire(questionnaire);
    }

    const previewQuestionnaireButton = (questionnaire: Questionnaire) => {
        setCurrentQuestionnaire(questionnaire);
        setPreviewQuestionnaire(true)
    }

    //let count = 0;
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div style={{display: "flex"}}>
                <button onClick={() => setQuestionnaireVisibility("All")} >All Questionnaires</button>
                <button onClick={() => setQuestionnaireVisibility("Template")}>Templates</button>
                <button onClick={() => setQuestionnaireVisibility("Active")}>Published</button>
                <button onClick={() => setQuestionnaireVisibility("Draft")}>Drafts</button>
                <p>Filter</p>
                <input onChange={(value) => setFilter(new RegExp(`.*${value.target.value.toLowerCase()}.*`))}></input>
                <button onClick={() => setQuestionnaireWorkshop("new")}>Create New</button>
            </div>
            <h4 style={{display: "flex", justifyContent: "left"}}>{questionnaireVisibility} Questionnaires</h4>
            <div style={{display: "flex", flexDirection: "column", overflowY: "auto"}}>
                {questionnaireList.map((questionnaire: Questionnaire) => {
                    // Dont populate with items that dont match the filter
                    if (!filter.test(questionnaire.name.toLowerCase())) return;
                    // Only populate 5 items
                    //if (count >= 5) return;
                    //count++;
                    return (
                        <div style={{display: "flex", justifyContent: "left", flexDirection: "row", width: "fit-content", height: "35px", backgroundColor: "lightgrey", margin: "5px", borderRadius: "10px", padding:"5px"}}>
                            <p style={{display: "flex", justifyContent: "left",width: "250px"}}>{questionnaire.name}</p>
                            <p style={{display: "flex", justifyContent: "left", width: "140px"}}>{questionnaire.questions.length} questions</p>
                            <p style={{display: "flex", justifyContent: "left", width: "140px"}}>{questionnaire.status}</p>
                            <p style={{display: "flex", justifyContent: "left", width: "140px"}}>{questionnaire.completed} responses</p>
                            <button style={{borderRadius: "10px", justifyContent: "left"}} onClick={ () => editQuestionnaire(questionnaire) }>
                                Edit
                            </button>
                            <button style={{borderRadius: "10px", justifyContent: "left"}} onClick={ () => previewQuestionnaireButton(questionnaire)} >
                                Preview
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
export default ComponentList;

