import { LogicBuilderStates } from "./LogicBuilder";
import { answer_categoryMappingTable, categoryTable } from "../../database";
import { LogicbuilderService } from "../../../api/services.gen";
import cookie from "cookie";
import { useState } from "react";

const CLogicWorkshop: React.FC<LogicBuilderStates> = ({ 
    questionnaireList,      setQuestionnaireList,
    categoryList,           setCategoryList,
    questionList,           setQuestionList, 
    selectedLink,           setSelectedLink,
    linkWorkshop,           setLinkWorkshop,
    selectedQuestionnaire,  setSelectedQuestionnaire,
    expandedQuestions,      setExpandedQuestions}) => {

    
        const [ checkedInclusive, setCheckedInclusive ] = useState(true);

        // Add new link to database, update frontend with results.
        const addLink = (e: React.MouseEvent<HTMLButtonElement>, answerID: number) => {
            e.preventDefault();
            const categorySelection = document.getElementById("categories") as HTMLSelectElement;
            const categoryID = parseInt(categorySelection.value);
            // Checking it makes it exclusive

            const mappingData = { questionnaire_id: selectedQuestionnaire.id, answer_id: answerID, category_id: categoryID, inclusive: checkedInclusive };

            LogicbuilderService.logicbuilderAddmappingCreate({ requestBody: mappingData })
                .then( response => {

                    // get the category text of the added mapping and reflect the change in the UI
                    const tempQuestionList = [ ...questionList ];
                    questionList.forEach((question, questionIndex) => {
                        question.answers.some((answer, answerindex) => {
                            if (answerID === answer.id) {
                                let categoryText = "";

                                categoryList.some( category => {
                                    if (categoryID === category.id) {
                                        categoryText = category.text;
                                        return true;
                                    }
                                })
                
                                tempQuestionList[questionIndex].answers[answerindex].categories.push({id: categoryID, text: categoryText, inclusive: checkedInclusive});
                            }
                        })
                    })
                    setCheckedInclusive(true);
                    setQuestionList(tempQuestionList);
                })
                .catch( error => {
                    console.log(error);
                })
        }
        
        return (
            <div style={{marginLeft: "10px"}}>
                {linkWorkshop && (
                    <div>
                    <h4>Rule Configuration</h4>
                    <h6>Question: {selectedLink?.text}</h6>
                    <h6>Response: {selectedLink?.answer?.text}</h6>
                    <h4>Linked Categories</h4>

                    <select id="categories">
                        <option value=""></option>
                        {categoryList.map((category) => {
                        if (selectedLink?.answer?.categories.some((categoryCheck) => category.id === categoryCheck.id)) return;
                        return(<option value={category.id}>{category.text}</option>)
                        })}
                    </select>
                    <input checked={checkedInclusive} type="checkbox" id="inclusiveBox" onChange={() => {setCheckedInclusive(!checkedInclusive)}} />
                    <label>Inclusive</label>
                    <br/>
                    <button onClick={(e) => addLink(e, selectedLink?.answer?.id)}>Link Category</button>

                    {selectedLink?.answer?.categories.map((category, index) => {
                        return (
                        <h6>{index+1}: {category.inclusive ? "✅" : "❌"}{category.text}</h6>
                        )
                    })}

                    <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/>
                    </div>
                )}
            </div>
        )
}
export default CLogicWorkshop;