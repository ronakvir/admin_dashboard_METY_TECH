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
    const createQuestionnaireButton = () => {
        //if (currentQuestionnaire.questions.length < 8) {alert("Must attach at least 8 questions!"); return;}
        
        const questionnaireRequestData = {
            id: 0,
            title: currentQuestionnaire.title,
            status: currentQuestionnaire.status,
            started: 0,
            completed: 0,
            last_modified: new Date().toISOString(),
            questions: currentQuestionnaire.questions.map( question => question.id )
        }

        QuestionnaireService.createQuestionnaire(questionnaireRequestData)
            .then( response => {
                currentQuestionnaire.id = response.id;
                setQuestionnaires([ ...questionnaires, currentQuestionnaire ]);
                setQuestionnaireWorkshop("");
                clearForms();
            })
            .catch( error => {
                console.error("Error creating questionnaire:", error);
                alert("failure");
            });
    };

    // Finalize and create the questionnaire
    const modifyQuestionnaireButton = () => {
        //if (currentQuestionnaire.questions.length < 8) {alert("Must attach at least 8 questions!"); return;}
        
        // Make a new object to fit the API request params
        const questionnaireRequestData = {
            id: currentQuestionnaire.id,
            title: currentQuestionnaire.title,
            status: currentQuestionnaire.status,
            started: currentQuestionnaire.started,
            completed: currentQuestionnaire.completed,
            last_modified: new Date().toISOString(),
            questions: currentQuestionnaire.questions.map( question => question.id )
        }

        QuestionnaireService.createQuestionnaire(questionnaireRequestData)
            .then( () => {
                let index = questionnaires.findIndex( questionnaire => currentQuestionnaire.id === questionnaire.id );
                
                const tempQuestionnaires = [ ...questionnaires ];
                tempQuestionnaires.splice(index, 1);
                setQuestionnaires(tempQuestionnaires);

                setQuestionnaires([ ...questionnaires, currentQuestionnaire ]);
                setQuestionnaireWorkshop("");
                clearForms();
            })
            .catch( error => {
                console.error("Error creating questionnaire:", error);
                alert("failure");
            });
    }
    
    // CAncel Questionnaire creation
    const cancelQuestionnaireButton = () => {
        setQuestionnaireWorkshop("");
        clearForms();
    }

    function clearForms() {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setQuestionIsSelected(false);
        setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
    }

    const deleteQuestionnaireButton = (questionnaire_id: number) => {
        if(!confirm("Are you sure you would like to delete this questionnaire? This action cannot be reversed.")) return;
        QuestionnaireService.deleteQuestionnaire(questionnaire_id)
            .then( response => {
                let index = questionnaires.findIndex( questionnaire => questionnaire_id === questionnaire.id );
                
                const tempQuestionnaires = [ ...questionnaires ];
                tempQuestionnaires.splice(index, 1);
                setQuestionnaires(tempQuestionnaires);
            })
            .catch( error => console.log(error) )
    }

    
    // This is the view that lets you create a new questionnaire or modify a current one
    return (
        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            {questionnaireWorkshop === "new" ?
                <h3>Create New Questionnaire:</h3> :
                <h3>Modify Existing Questionnaire:</h3>
            }
            <h6>Questionnaire Name:</h6>
            <input style={{width: "830px"}} value={currentQuestionnaire.title} onChange={(value) => setCurrentQuestionnaire({...currentQuestionnaire, title: value.target.value})} />
            <h6>Questionnaire Status:</h6>
            <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                <button style={{backgroundColor: currentQuestionnaire.status === "Published" ? "darkgrey" : "", flex: 1}} onClick={() => setCurrentQuestionnaire({...currentQuestionnaire, status: "Published"})}>Publish</button>
                <button style={{backgroundColor: currentQuestionnaire.status === "Draft" ? "darkgrey" : "", flex: 1}} onClick={() => setCurrentQuestionnaire({...currentQuestionnaire, status: "Draft"})}>Draft</button>
                <button style={{backgroundColor: currentQuestionnaire.status === "Template" ? "darkgrey" : "", flex: 1}} onClick={() => setCurrentQuestionnaire({...currentQuestionnaire, status: "Template"})}>Template</button>
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
                        <>                        
                            <button style={{flex: 1, margin: "5px"}} onClick={() => createQuestionnaireButton()}> Create Questionnaire</button>
                            <button style={{flex: 1, margin: "5px"}} onClick={() => cancelQuestionnaireButton()}> Cancel</button>
                            
                        </>:
                        <>
                            <button style={{flex: 1, margin: "5px"}} onClick={() => modifyQuestionnaireButton()}> Update Questionnaire</button>
                            <button style={{flex: 1, margin: "5px"}} onClick={() => cancelQuestionnaireButton()}> Cancel</button>
                            <button style={{flex: 1, margin: "5px", backgroundColor: "lightcoral"}} onClick={() => deleteQuestionnaireButton(currentQuestionnaire.id)}> Delete</button>
                        </>
                    }


            </div>
        </div>

    )
}
export default ComponentWorkshop;