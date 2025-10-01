import { useEffect, FC, Dispatch, SetStateAction, useState } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { answer_categoryMappingTable, categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { QuestionnairebuilderService } from "../../../api/services.gen";
import { VideoResponse } from "../../../api/types.gen";


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
    const [qResponses, setQResponses] = useState<number[]>(new Array(currentQuestionnaire.questions.length));
    const [matchedVideos, setMatchedVideos] = useState<VideoResponse[]>([]);

    const returnToDashboard = () => {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setPreviewQuestionnaire(false);
    }

    const updateResponses = (answer: {id: number, text: string}, index: number) => {
        const tempResponses = [ ...qResponses ]
        tempResponses[index] = answer.id;
        setQResponses(tempResponses);
    }

    const submitAnswers = () => {
        const tempMatched: number[] = [];

        const requestData = {
            questionnaire_id: currentQuestionnaire.id,
            answer_ids: qResponses
        }
        QuestionnairebuilderService.questionnairebuilderGetvideosCreate({ requestBody: requestData })
            .then( response => {
                setMatchedVideos(response)
            })
            .catch( error => console.log(error) )

        // answer_categoryMappingTable.forEach((mapping) => {
        //     if (currentQuestionnaire.id !== mapping.questionnaireID) return;
        //     qResponses.forEach((responseID) => {
        //         if (responseID !== mapping.answerID) return;
        //         tempMatched.push(mapping.categoryID);
        //     })
        // })
        // const tempVideoIDs: number[] = [];
        // videoCategoriesMappingTable.forEach((mapping) => {
        //     tempMatched.forEach((catID) => {
        //         if (catID === mapping.categoryID) {
        //             tempVideoIDs.push(mapping.videoID);
        //         }
        //     })
        // })


        // // Creating an array with unique values, ordered by most appearing value.
        // const freqMap = new Map<number, number>();
        // tempVideoIDs.forEach(num => {
        //     freqMap.set(num, (freqMap.get(num) || 0) + 1);
        // });
        
        // const uniqueVideos = [...new Set(tempVideoIDs)];
        // uniqueVideos.sort((a, b) => (freqMap.get(b)! - freqMap.get(a)!));



        // const tempVideos = [{ id: 0, title: '', duration: '', description: '' }]
        // tempVideos.splice(0, 1);
        // uniqueVideos.forEach((videoID) => {
        //     tempVideos.push({id: videoID, title: videoTable.get(videoID)?.title as string, duration: videoTable.get(videoID)?.duration as string, description: videoTable.get(videoID)?.description as string});
        // })
        // setMatchedVideos(tempVideos);
    }

    return (
        <>
            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <button style={{width: "415px"}} onClick={() => returnToDashboard()}> Return to Dashboard</button>
                <h4>{currentQuestionnaire.title}</h4>
                <div style={{display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: "10px", width: "830px"}}>
                    { (() => {
                    return currentQuestionnaire.questions.map((question: any, index: number) => {
                        return (
                            
                        <div key={index} style={{borderRadius: "10px", backgroundColor: "lightgrey", padding: "20px", aspectRatio: "1", justifyContent: "flex-start", alignItems: "flex-start", display: "flex", flexDirection: "column", border: "1px solid black"}}>
                            <h5>{question?.text}</h5>
                            { (() => {
                                let type = question?.type;
                                if (type === "slider") {
                                    return <input type="range" style={{width: "100%", padding: "20px", }} onChange={(value) => setTempSliderValue(Number(value.target.value))}/>;
                                }
                                else if (type === "text") {
                                    return <input style={{height: "auto", width: "100%", padding: "5px 10px", }}></input>;
                                }
                                else {
                                    return question?.answers.map((answer: any) => {
                                        if (type === "multichoice") {
                                            return (
                                                <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                                    <input onChange={() => updateResponses(answer, index)} type="radio" name={question.text} value={answer.text} />
                                                    <label htmlFor={question?.text}>{answer.text} - id: {answer.id}</label>
                                                </div>
                                            )
                                     
                                        }
                                        else if (type === "checkbox") {
                                            return (
                                                <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                                                    <input type="checkbox" name={question.text} value={answer.text} />
                                                    <label htmlFor={question.text}>{answer.text}</label>
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
                <div style={{display: "flex", flexDirection: "column"}}>
                    <button onClick={submitAnswers}>Submit</button>
                    {matchedVideos.length > 0 ? (
                        matchedVideos.map((video, index) => {
                            return (
                            <div key={video.id} style={{border: "1px solid #ccc", padding: "10px", margin: "5px 0", borderRadius: "5px"}}>
                                <p><strong>{index+1}: {video.title}</strong></p>
                                <p><strong>Duration:</strong> {video.duration}</p>
                                <p><strong>Description:</strong> {video.description}</p>
                                {video.url && (
                                    <p><strong>URL:</strong> <a href={video.url} target="_blank" rel="noopener noreferrer" style={{color: "blue", textDecoration: "underline"}}>{video.url}</a></p>
                                )}
                            </div>
                            )
                        })
                    ) : (
                        <div style={{border: "1px solid #ccc", padding: "20px", margin: "5px 0", borderRadius: "5px", textAlign: "center", backgroundColor: "#f5f5f5"}}>
                            <p style={{fontSize: "16px", color: "#666", margin: 0}}>No videos found matching your responses.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ComponentPreview;