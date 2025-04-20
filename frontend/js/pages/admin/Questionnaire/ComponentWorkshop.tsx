import { useEffect, FC, Dispatch, SetStateAction } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnaireService } from "../../../api";
import { question_questionnaireTable, question_questionnaireTableIndex, questionnaireTable, questionnaireTableIndex } from "../../database";


const ComponentWorkshop: FC<QuestionnaireStates> = ({ 
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
  
    let questionnaireTableIndexLocal = questionnaireTableIndex;
    let question_questionnaireTableIndexLocal = question_questionnaireTableIndex;
    // Remove a question from the current Questionnaire
    const removeFromQuestionnaire = (index: number) => {
        const updatedQuestions = [ ...currentQuestionnaire.questions ];
        updatedQuestions.splice(index, 1);
        setCurrentQuestionnaire({ ...currentQuestionnaire, questions: updatedQuestions })
    }

    // Finalize and create the questionnaire
    const createQuestionnaire = () => {
        //if (currentQuestionnaire.questions.length < 8) {alert("Must attach at least 8 questions!"); return;}
            
        QuestionnaireService.addQuestionnaires(currentQuestionnaire)
            .then( response => {

                setQuestionnaires([ ...questionnaires, response ]);
                setQuestionnaireWorkshop("");
                clearForms();
            })
            .catch( error => {
                console.error("Error creating questionnaire:", error);
                alert("failure");
            });
    };

    // Finalize and create the questionnaire
    const modifyQuestionnaire = () => {
        if (currentQuestionnaire.questions.length < 8 || currentQuestionnaire.title == "") {
            alert("You must have at least 8 questions and name the questionnaire!");
            return;
        }
        
        currentQuestionnaire.last_modified = new Date().toISOString();

        let index = questionnaires.findIndex(questionnaire => questionnaire.id === currentQuestionnaire.id);
        let updatedQuestionnaires = [ ...questionnaires ];
        updatedQuestionnaires[index] = currentQuestionnaire;

        setQuestionnaires(updatedQuestionnaires);
        alert("Questionnaire Created Successfully!");
        setQuestionnaireWorkshop("");
        clearForms();

        // SEND API CALL TO UPDATE QUESTIONNAIRE IN DB
    }
    
    // CAncel Questionnaire creation
    const cancelQuestionnaire = () => {
        setQuestionnaireWorkshop("");
        clearForms();
    }

    function clearForms() {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setQuestionIsSelected(false);
        setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
    }
    
    // This is the view that lets you create a new questionnaire or modify a current one
    return (
        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            {questionnaireWorkshop === "new" ?
                <h3>Create a new Questionnaire:</h3> :
                <h3>Modify existing Questionnaire:</h3>
            }
            <h6>Questionnaire Name:</h6>
            <input style={{width: "830px"}} value={currentQuestionnaire.title} onChange={(value) => setCurrentQuestionnaire({...currentQuestionnaire, title: value.target.value})} />
            <h6>Questionnaire Status:</h6>
            <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                <button style={{backgroundColor: currentQuestionnaire.status === "Active" ? "darkgrey" : "", width: "270px"}} onClick={() => setCurrentQuestionnaire({...currentQuestionnaire, status: "Active"})}>Active</button>
                <button style={{backgroundColor: currentQuestionnaire.status === "Draft" ? "darkgrey" : "", width: "270px"}} onClick={() => setCurrentQuestionnaire({...currentQuestionnaire, status: "Draft"})}>Draft</button>
                <button style={{backgroundColor: currentQuestionnaire.status === "Template" ? "darkgrey" : "", width: "270px"}} onClick={() => setCurrentQuestionnaire({...currentQuestionnaire, status: "Template"})}>Template</button>
            </div>
            <h6>Questionnaire Questions:</h6>
            {/* Updates the Questionnaire Title and input field*/}
            <div style={{display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: "10px", width: "830px"}}>
                { (() => {
                //const tempQuestions = Array.from(currentQuestionnaire.questions);
                return currentQuestionnaire.questions.map((question, index) => (

                    <div style={{borderRadius: "10px", backgroundColor: "lightgrey", padding: "20px", aspectRatio: "1", justifyContent: "flex-start", alignItems: "flex-start", display: "flex", flexDirection: "column", border: "1px solid black"}}>
                        <p>Question: {question.text}</p>
                        <p>Type: {question.type}</p>
                        <button onClick={() => removeFromQuestionnaire(index)}>Remove</button>
                    </div>

                ))
                })()}
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
                    {questionnaireWorkshop === "new" ?
                        <button style={{width: "415px"}} onClick={() => createQuestionnaire()}> Create Questionnaire</button> :
                        <button style={{width: "415px"}} onClick={() => modifyQuestionnaire()}> Save Questionnaire</button>
                    }
                    <button style={{width: "415px"}} onClick={() => cancelQuestionnaire()}> Cancel/Discard</button>
            </div>
        </div>

    )
}
export default ComponentWorkshop;