import { useEffect, FC, Dispatch, SetStateAction } from "react";
import { Questionnaire, Question } from "./QuestionnaireBuilder"

// Interface for the parent's states
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
}

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
    questionIsSelected,         setQuestionIsSelected}) => {



    // which question types are we working with??
    // creates those form fields and shows a list of them
    const addQuestionForms = () => {
        if (questionType === "") return <></>;

        return (

        <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>

            <div style={{display: "flex", flexDirection: "column", gap: "5px", justifyContent: "left"}}>
                {/* This is the "Add Question" form field section */}
                <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>
                    <h4 style={{display: "flex", justifyContent: "left"}}>Add {questionType} Question</h4>
                    <button style={{display: "inline", maxWidth: "100"}} onClick={() => setQuestionType("")}>Cancel</button>
                </div>
                <input onChange={(value) => setQuestionForms({ ...questionForms, [value.target.name]: value.target.value })} name="question" style={{display: "inline", width: "200px"}} type="text" placeholder="Question" value={questionForms.question} />
                
                { // This checks if the button clicked was a checkbox or multichoice type question card and displays the fields accordingly
                    (questionType === "checkbox" || questionType === "multichoice") && (
                    <>
                        <button style={{width: "300px"}} onClick={() => setQuestionForms({ ...questionForms, answers: [ ...questionForms.answers, ""] })}>Add Answer</button>
                        {questionForms.answers.map((answer, index) =>(
                            <div style={{display: "flex", flexDirection:"row"}} key={index}>
                                <input onChange={(e) => updateAnswer(index, e.target.value)} name="answer" style={{display: "inline", maxWidth: "200px"}} type="text" placeholder="Answer" value={questionForms.answers[index]} />
                                <button onClick={async () => removeAnswerField(index)}>X</button>
                            </div>
                        ))}
                    </>
                    )
                }
                {/* This builds the question viewer with the items you can select */}
                {questionIsSelected ? 
                    <>
                        <button style={{display: "inline", maxWidth: "300px"}} onClick={async () => modifyQuestion()}>Modify Question</button>
                        <button style={{display: "inline", maxWidth: "300px"}} onClick={async () => deleteQuestion()}>Delete Question</button>
                    </> :
                    <button style={{display: "inline", maxWidth: "300px"}} onClick={async () => addQuestion()}>Add Question</button>
                }
                
            </div>

            {/* This is the question preview box */}
            <div style={{display: "grid", flexWrap: "nowrap", gridTemplateColumns: "repeat(1, minmax(160px, 1fr))", gap: "10px"}}>
                <div style={{borderRadius: "10px", backgroundColor: "lightgrey", padding: "20px", aspectRatio: "1", justifyContent: "flex-start", alignItems: "flex-start", display: "flex", flexDirection: "column", border: "1px solid black"}}>
                    <h5>{questionForms.question}</h5>
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
                                            <input type="radio" name={questionForms.question} value={answer} />
                                            <label htmlFor={questionForms.question}>{answer}</label>
                                        </div>
                                    )
                                
                                }
                                else if (type === "checkbox") {
                                    return (
                                        <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                            <input type="checkbox" name={questionForms.question} value={answer} />
                                            <label htmlFor={questionForms.question}>{answer}</label>
                                        </div>
                                    )
                                
                                }
                            })
                        }
                    })()}
                </div>
            </div>

            {/* This builds the question viewer with the items you can select */}
            <div style={{height: "250px", width: "300px", gap: "5px", justifyContent: "right", borderStyle: "solid", borderColor:"black"}}>
            <table>
                <thead>
                <tr>
                    <th>Question</th>
                </tr>
                </thead>
                <tbody style={{overflowY: "auto"}}>
                { (() => {
                const tempQuestions = Array.from(questions);
                return tempQuestions.map(([key, question]) => {
                    if (question.type !== questionType) return;
                    return (
                    <tr className="questionRow" onClick={() => selectQuestion(question)} style={{height: "20px", backgroundColor: questionForms.id === question.id ? "grey" : "white"}}>
                        <td style={{justifyContent: "left"}}>{question.question}</td>
                    </tr>
                    );
                })
                })()}

                </tbody>
            </table>
            {questionnaireWorkshop !== "" ? <button onClick={() => addToQuestionnaire()}>Add to Questionnaire</button> : <></>}
            </div>
        </div>
        )
    }

    // Updates the formData answers every time a answer field is added or removed
    const updateAnswer = (index: number, value: string) => {
        const newAnswers = [...questionForms.answers];
        newAnswers[index] = value;
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
    const selectQuestion = (question: {id: string; type: string; question: string; answers: string[]}) => {
        if (questionForms.id === question.id) setQuestionIsSelected(false);
        else setQuestionIsSelected(true);

        setQuestionForms(current => 
        current.id === question.id  ?  {id: "", type: questionType, question: "", answers: ["", ""]} : question);
    }
    
    // Adds the completed question to the questions array.
    // This will eventually be changed to adding it to the database.
    const addQuestion = () => {
        if (questionForms.question.trim() == "") {
            alert("You must enter a question first!");
            return;
        }

        const id = (Math.random() * 999999).toString();
        questionForms.id = id;

        setQuestions(new Map(questions.set(questionForms.id, questionForms)));
        if (questionnaireWorkshop === "") {
            clearForms();
        } else {
            setQuestionIsSelected(false);
            setQuestionForms({ id: "", type: "multichoice", question: "", answers: ["", ""] });
        }
        
    }

    // modify Question Button Action
    const modifyQuestion = () => {
        if (questionForms.question.trim() == "") {
            alert("You must enter a question first!");
            return;
        }

        const updatedQuestions = new Map(questions);
        updatedQuestions.set(questionForms.id, questionForms);

        setQuestions(updatedQuestions);
        if (questionnaireWorkshop === "") {
            clearForms();
        } else {
            setQuestionIsSelected(false);
            setQuestionForms({ id: "", type: "multichoice", question: "", answers: ["", ""] });
        }
    }

    // Delete Question Button Action
    const deleteQuestion = () => {
        const updatedQuestions = new Map(questions);
        updatedQuestions.delete(questionForms.id);

        setQuestions(updatedQuestions);
        if (questionnaireWorkshop === "") {
            clearForms();
        } else {
            setQuestionIsSelected(false);
            setQuestionForms({ id: "", type: "multichoice", question: "", answers: ["", ""] });
        }
    }

    // Add the selected question to the current Questionnaire
    const addToQuestionnaire = () => {
        if (!questionIsSelected) return;
    
        setCurrentQuestionnaire({ ...currentQuestionnaire, questions: [ ...currentQuestionnaire.questions, questionForms.id ] });
        setQuestionIsSelected(false);
        setQuestionForms({ id: "", type: "multichoice", question: "", answers: ["", ""] });
    }
    
    function clearForms() {
        setCurrentQuestionnaire({ id: "", name: "", status: "", responses: "", lastModified: "", questions: []});
        setQuestionIsSelected(false);
        setQuestionForms({ id: "", type: "multichoice", question: "", answers: ["", ""] });
    }

    // Checks how many questionnaires each question type has been used in
    useEffect(() => {
        questionCount = [0, 0, 0, 0];
        questionnaires.forEach( (questionnaire) => {
            questionnaire.questions.forEach((id)=> {
                if (questions.get(id)?.type === "multichoice") questionCount[0]++;
                else if (questions.get(id)?.type === "checkbox") questionCount[1]++;
                else if (questions.get(id)?.type === "slider") questionCount[2]++;
                else if (questions.get(id)?.type === "text") questionCount[3]++;
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