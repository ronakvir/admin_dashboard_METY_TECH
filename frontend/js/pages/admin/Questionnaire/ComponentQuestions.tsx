import { useEffect, FC, Dispatch, SetStateAction } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnairebuilderService } from "../../../api/services.gen";


// Global variable to declare only on load. this keeps track of each types question count
let questionCount = [0, 0, 0, 0];



const ComponentQuestions: FC<QuestionnaireStates> = ({ 
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


    let indexCounter = 100;
    // which question types are we working with??
    // creates those form fields and shows a list of them
    const addQuestionForms = () => {
        if (questionType === "") return <></>;

        return (

        <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>

            <div style={{display: "flex", flexDirection: "column", gap: "5px", justifyContent: "left", flex: 1}}>
                {/* This is the "Add Question" form field section */}
                <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>
                    <h4 style={{display: "flex", justifyContent: "left", width: "300px"}}>{questionType} Question</h4>
                    {/* This builds the question viewer with the items you can select */}
                    {questionIsSelected ? 
                        <>
                            <button style={{display: "inline"}} onClick={async () => modifyQuestion()}>Modify</button>
                            <button style={{display: "inline"}} onClick={async () => deleteQuestion()}>Delete</button>
                        </> :
                        <button style={{display: "inline", maxWidth: "300px"}} onClick={async () => addQuestion()}>Add</button>
                    }
                
                    <button style={{display: "inline", flex: 1, height: "auto"}} onClick={() => setQuestionType("")}>Cancel</button>
                </div>
                <input onChange={(value) => setQuestionForms({ ...questionForms, text: value.target.value })} name="question" style={{display: "inline", width: "100%", height: "auto"}} type="text" placeholder="Question" value={questionForms.text} />
                
                { // This checks if the button clicked was a checkbox or multichoice type question card and displays the fields accordingly
                    (questionType === "checkbox" || questionType === "multichoice") && (
                    <>
                        
                        {questionForms.answers.map((answer, index) =>(
                            <div style={{display: "flex", flexDirection:"row", width: "100%", height: "auto"}} key={index}>
                                <input onChange={(e) => addAnswerField(index, e.target.value)} name="answer" type="text" placeholder="Answer" value={questionForms.answers[index].text} style={{flex: 1}}/>
                                <button onClick={async () => removeAnswerField(index)}>X</button>
                            </div>
                        ))}
                    </>
                    )
                }
                <button style={{width: "100%", height: "auto"}} onClick={() => setQuestionForms({ ...questionForms, answers: [ ...questionForms.answers, {id: 0, text: ""}] })}>Add Answer</button>

            </div>

            {/* This builds the question viewer with the items you can select */}
            <div style={{display: "flex", flexDirection: "column", flex: 1}}>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <h4>Questions</h4>
                    {questionnaireWorkshop !== "" ? <button onClick={() => addToQuestionnaire()}style={{width: "100%", height: "auto"}}>Add to Questionnaire</button> : <></>}
                </div>
                <div style={{height: "300px", width: "100%", gap: "5px", justifyContent: "right", borderStyle: "solid", borderColor: "black", overflowY: "auto"}}>
                    { (() => {
                        return questions.map((question) => {
                            if (question.type !== questionType) return;
                            return (
                            <div className="questionRow" onClick={() => selectQuestion(question)} style={{margin: "5px", height: "20px", backgroundColor: questionForms.id === question.id ? "grey" : "white", overflow: "hidden", textOverflow: "ellipses", whiteSpace: "nowrap"}}>
                                {question.text}
                            </div>
                            );
                        })
                    })()}
                </div>
                
            </div>

            {/* This is the question preview box */}
            <div style={{display: "flex", flexDirection: "column", flex: 1}}>
                <h4>Preview</h4>
                <div style={{display: "grid", flexWrap: "nowrap", gridTemplateColumns: "repeat(1, minmax(160px, 1fr))", gap: "10px", width: "100%", height: "300px"}}>
                    <div style={{borderRadius: "10px", backgroundColor: "lightgrey", padding: "20px", aspectRatio: "1", justifyContent: "flex-start", alignItems: "flex-start", display: "flex", flexDirection: "column", border: "1px solid black"}}>
                        <h5>{questionForms.text}</h5>
                        { (() => {
                            let type = questionForms.type;
                            if (type === "slider") {
                                return <input type="range" style={{width: "100%", padding: "20px", }} onChange={() => ""}/>;
                            }
                            else if (type === "text") {
                                return <input style={{height: "auto", width: "100%", padding: "5px 10px", }}></input>;
                            }
                            else {
                                return questionForms.answers.map((answer, index) => {
                                    if (type === "multichoice") {
                                        return (
                                            <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                                <input type="radio" name={questionForms.text} value={answer.text} />
                                                <label htmlFor={questionForms.text}>{answer.text}</label>
                                            </div>
                                        )
                                    
                                    }
                                    else if (type === "checkbox") {
                                        return (
                                            <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                                <input type="checkbox" name={questionForms.text} value={answer.text} />
                                                <label htmlFor={questionForms.text}>{answer.text}</label>
                                            </div>
                                        )
                                    }
                                })
                            }
                        })()}
                    </div>
                </div>
            </div>
        </div>
        )
    }

    // Updates the formData answers every time a answer field is added or removed
    const addAnswerField = (index: number, value: string) => {
        const newAnswers = [...questionForms.answers];
        newAnswers[index].text = value;
        newAnswers[index].id = 0;
        setQuestionForms({ ...questionForms, answers: newAnswers });
    }
    
    // Removes an answer field from ther formData.answers array based on the given index
    const removeAnswerField = async (index: number) => {
        if (questionForms.answers.length < 3) return;
        const updatedAnswers = [...questionForms.answers];
        updatedAnswers.splice(index, 1);
        setQuestionForms({ ...questionForms, answers: updatedAnswers })
    }

    // Helper Function to click on a question item from the list.
    const selectQuestion = (question: {id: number; type: string; text: string; answers: {id: number, text: string}[]}) => {
        if (questionForms.id === question.id) setQuestionIsSelected(false);
        else setQuestionIsSelected(true);

        setQuestionForms(current => current.id === question.id  ?  {id: 0, type: questionType, text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}]} : question);
    }
    
    // Adds the completed question to the Database.
    const addQuestion = () => {
        if (questionForms.text.trim() == "") {alert("You must enter a question first!"); return;}

        QuestionnairebuilderService.questionnairebuilderAddquestionCreate({ requestBody: questionForms })
            .then( response => {
                const tempQuestions = [ ...questions ]
                tempQuestions.push(response);
                setQuestions(tempQuestions);

                if (questionnaireWorkshop === "") {
                    clearForms();
                } else {
                    setQuestionIsSelected(false);
                    setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
                }
            })
            .catch( error => console.log(error))

    }

    // modify Question Button Action
    const modifyQuestion = () => {
        if (questionForms.text.trim() == "") {alert("You must enter a question first!"); return;}

        QuestionnairebuilderService.questionnairebuilderAddquestionCreate({ requestBody: questionForms })
            .then( response => {
                // Get the index of the question  in the question list
                let index = 0;
                questions.some( (question, i) => {
                    if (question.id === response.id) {
                        index = i;
                        return true;
                    } 
                })

                // Replace the modified Question locally
                const tempQuestions = [ ...questions ]
                tempQuestions[index] = response;
                setQuestions(tempQuestions);

                // Reset components
                if (questionnaireWorkshop === "") {
                    clearForms();
                } else {
                    setQuestionIsSelected(false);
                    setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
                }
            })
            .catch( error => console.log(error))
        }

    // Delete Question Button Action
    const deleteQuestion = () => {
        QuestionnairebuilderService.questionnairebuilderDeletequestionDestroy({ id: questionForms.id })
            .then( () => {
                let index = 0;
                questions.some( (question, i) => {
                    if (question.id === questionForms.id) {
                        index = i;
                        return true;
                    } 
                })
                const tempQuestions = [ ...questions ]
                
                tempQuestions.splice(index, 1);
                setQuestions(tempQuestions);

                if (questionnaireWorkshop === "") {
                    clearForms();
                } else {
                    setQuestionIsSelected(false);
                    setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
                }
            })
            .catch( error => console.log(error))
    }

    // Add the selected question to the current Questionnaire
    const addToQuestionnaire = () => {
        if (!questionIsSelected) return;
    
        setCurrentQuestionnaire({ ...currentQuestionnaire, questions: [ ...currentQuestionnaire.questions, questionForms ] });
        setQuestionIsSelected(false);
        setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
    }
    
    function clearForms() {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setQuestionIsSelected(false);
        setQuestionForms({ id: 0, type: "multichoice", text: "", answers: [{id: 0, text: ""}, {id: 0, text: ""}] });
    }

    // Checks how many questionnaires each question type has been used in
    useEffect(() => {
        questionCount = [0, 0, 0, 0];
        questionnaires.forEach( (questionnaire) => {
            questionnaire.questions.forEach((question)=> {
                if (question.type === "multichoice") questionCount[0]++;
                else if (question.type === "checkbox") questionCount[1]++;
                else if (question.type === "slider") questionCount[2]++;
                else if (question.type === "text") questionCount[3]++;
            })
        })
    });

    // Question Section - These are the Question Type Cards
    return (
      <div style={{display: "flex", flexDirection: "column"}}>
        <h4 style={{display: "flex", justifyContent: "left"}}>Question Types</h4>
        <div style={{display: "flex", flexDirection: "row"}}>
          {questionCount.map((amount, index) => 
            {   
                let name = "";
                let type = "";
                switch (index) {
                    case 0: name = "Multiple Choice"; type = "multichoice"; break;
                    case 1: name = "Checkbox"; type = "checkbox"; break;
                    case 2: name = "Slider Scale"; type = "slider"; break;
                    case 3: name = "Text Input"; type = "text"; break;
                }
              // Create the Cards
              return  (
                <div onClick={() => setQuestionType(type)} style={{width: "200px", height: "225px", backgroundColor: (questionType === type ? "darkgrey" : "lightgrey"), borderRadius: "15px", overflow: "hidden", margin: "5px", padding: "10px"}}>
                  <h3>{name}</h3>
                  <p>Used in {questionCount[index]} questionnaires</p>
                </div>
              )
            }
          )}
        </div>
        {addQuestionForms()}
      </div>
    )
}
export default ComponentQuestions;