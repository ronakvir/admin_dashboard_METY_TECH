import { Questionnaire, Question } from "js/api";
import { Dispatch, SetStateAction, useState } from "react";
import { LogicBuilderStates, QuestionCategory } from "./LogicBuilder";
import { answer_categoryMappingTable, categoryTable } from "../../database";


const CLogicWorkshop: React.FC<LogicBuilderStates> = ({ 
    questionnaireList,      setQuestionnaireList,
    categoryList,           setCategoryList,
    questionList,           setQuestionList, 
    selectedLink,           setSelectedLink,
    linkWorkshop,           setLinkWorkshop,
    selectedQuestionnaire,  setSelectedQuestionnaire,
    expandedQuestions,      setExpandedQuestions}) => {

    // Add new link to database, update frontend with results.
    const addLink = (answerID: number) => {

        // DO API CALL HERE

        // TEMP CODE

        let element = document.getElementById("categories") as HTMLSelectElement;
        let categoryID = parseInt(element.value);

        let newKey = Array.from(answer_categoryMappingTable.keys()).pop() as number;
        newKey++;
        answer_categoryMappingTable.set(newKey, { questionnaireID: selectedQuestionnaire.id, answerID: answerID, categoryID: categoryID, inclusive: true});
        console.log(newKey);
        const tempQuestionList = [ ...questionList ];
        questionList.forEach((question, questionIndex) => {
            question.answers.some((answer, answerindex) => {
                if (answerID === answer.id) {
                tempQuestionList[questionIndex].answers[answerindex].categories.push({id: categoryID, value: categoryTable.get(categoryID)?.category as string });
                }
            })
        })
        // END TEMP CODE

        setQuestionList(tempQuestionList);
    }
    
    return(
        <div style={{marginLeft: "10px"}}>
            {linkWorkshop && (
                <div>
                <h4>Rule Configuration</h4>
                <h6>Question: {selectedLink?.question}</h6>
                <h6>Response: {selectedLink?.answer?.value}</h6>
                <h4>Linked Categories</h4>

                <select id="categories">
                    <option value=""></option>
                    {categoryList.map((category) => {
                    if (selectedLink?.answer?.categories.some((categoryCheck) => category.id === categoryCheck.id)) return;
                    return(<option value={category.id}>{category.category}</option>)
                    })}
                </select>
                <button onClick={() => addLink(selectedLink?.answer?.id)}>Link Category</button>

                {selectedLink?.answer?.categories.map((category, index) => {
                    return (
                    <h6>{index+1}: {category.value}</h6>
                    )
                })}

                <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/>
                </div>
            )}
        </div>
    )
}
export default CLogicWorkshop;