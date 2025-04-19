import { categoryTable, question_questionnaireTable, questionTable, answerTable, answer_categoryMappingTable } from "../../database";
import CLogicWorkshop from "./CLogicWorkshop";
import { LogicBuilderStates, QuestionCategory } from "./LogicBuilder"

const CQuestionnaireTable: React.FC<LogicBuilderStates> = ({ 
    questionnaireList,      setQuestionnaireList,
    categoryList,           setCategoryList,
    questionList,           setQuestionList, 
    selectedLink,           setSelectedLink,
    linkWorkshop,           setLinkWorkshop,
    selectedQuestionnaire,  setSelectedQuestionnaire,
    expandedQuestions,      setExpandedQuestions}) => {
    
    
    // Opens the edit links component
    const editLinksButton = (question: QuestionCategory, answer: { id: number; value: string; categories: { id: number; value: string; }[]; }) => {
        const modifiedQuestion = { id: question.id, question: question.question, answer: answer }
        setSelectedLink(modifiedQuestion); 
        setLinkWorkshop(true);
        console.log(JSON.stringify(answer));
    }

    // Delete matching link from the database, update frontend with results.
    const deleteLinksButtonn = (answerID: number) => {
        if (!confirm("Are you sure you would like to delete the links to this response?")) return;
        // DO API CALL HERE

        // TEMP CODE
        const tempMappingDatabase = answer_categoryMappingTable;
        tempMappingDatabase.forEach(( mapping, key ) => {
        if ( selectedQuestionnaire.id === mapping.questionnaireID && answerID === mapping.answerID) {
            answer_categoryMappingTable.delete(key);
        }
        })

        const tempQuestionList = [ ...questionList ];
        questionList.forEach((question, questionIndex) => {
        question.answers.some((answer, answerindex) => {
            if (answerID === answer.id) {
            tempQuestionList[questionIndex].answers[answerindex].categories = [];
            }
        })
        })
        // END TEMP CODE
        setQuestionList(tempQuestionList);
    }

    const expandQuestionButton = (questionIndex: number) => {
        const tempExpandedQuestions: boolean[] = [ ...expandedQuestions ];
        tempExpandedQuestions[questionIndex] = true;
        setExpandedQuestions(tempExpandedQuestions);
    }

    const collapseQuestionButton = (questionIndex: number) => {
        const tempExpandedQuestions: boolean[] = [ ...expandedQuestions ];
        tempExpandedQuestions[questionIndex] = false;
        setExpandedQuestions(tempExpandedQuestions);
    }

    const expandedRowJSX = (question: QuestionCategory, questionIndex: number) => {
        return (   
           <tr onClick={() => collapseQuestionButton(questionIndex)}  key={questionIndex} style={{transition: "all 0.3 ease", border: "1px solid"}}>
                <td style={{display: "flex", flexDirection: "row", margin: "5px"}}>   
                    <div style={{border: "1px solid", marginRight: "5px"}}>⮝</div>                                  
                    {question.question}
                    
                </td>
                <td>
                <div style={{display: "flex", flexDirection: "column"}}>   
                    {question.answers.map((answer, answerIndex) => {
                    return (
                        <>                 
                        {answer.value}
                        <br/>
                        </>   
                    ) 
                    })}
                </div>
                </td>
                <td>
                <div style={{display: "flex", flexDirection: "column"}}>   
                    {question.answers.map((answer, answerIndex) => {
                        return (
                        <>                 
                            Categories Linked: {answer.categories.length}
                            <br/>
                        </>   
                        ) 
                    })}
                    </div>
                </td>
                <td>
                    <div style={{display: "flex", flexDirection: "column"}}>   
                    {question.answers.map((answer, answerIndex) => {
                        return (
                        <>     
                            <div style={{display: "flex", flexDirection: "row", height:"23px"}}>
                                
                                <button onClick={(e) => {e.stopPropagation(); editLinksButton(question, answer)}}>E</button>
                                <button onClick={(e) => {e.stopPropagation(); deleteLinksButtonn(answer.id)}}>X</button>
                            </div>
                        </>   
                        ) 
                    })}
                    </div>
                </td>
            </tr> 
        )
    }

    const collapsedRowJSX = (question: QuestionCategory, questionIndex: number) => {
        return(
            <tr onClick={() => expandQuestionButton(questionIndex)} key={questionIndex} style={{transition: "all 0.3 ease", border: "1px solid"}}>
                <td style={{display: "flex", flexDirection: "row", margin: "5px"}}>   
                    <div style={{border: "1px solid", marginRight: "5px"}}>⮟</div>                                  
                    {question.question}
                    
                </td>
                {(() => {
                    const answerCount = question.answers.length;
                    const mappedCount = question.answers.filter(answer => (answer.categories.length > 0)).length;

                    return(
                        <td>
                            {mappedCount} of {answerCount} mapped responses
                        </td>
                    );
                })()}
                    
                <td></td>
                <td></td>
            </tr> 
        )
    }

    return (
        <>
            {questionList.length > 0 &&
            <div style={{display:"flex", flexDirection: "row", alignItems: "flex-start"}}>
                <table>
                    <thead>
                    <tr>
                        <th>Question</th>
                        <th>Response</th>
                        <th>Linked Categories</th>
                        <th>Actions</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Renders the Question-Response-Category Table - The ternary condition determines if the row is expanded or condensed*/
                        questionList.map((question, questionIndex) => {
                            return( 
                                !expandedQuestions[questionIndex] ?
                                collapsedRowJSX(question, questionIndex) :
                                expandedRowJSX(question, questionIndex)
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>
            }
        </>
    )
}
export default CQuestionnaireTable;