import { useEffect, FC, useState } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnairebuilderService } from "../../../api/services.gen";
import { VideoResponse } from "../../../api/types.gen";

const ComponentPreview: FC<QuestionnaireStates> = ({ 
    currentQuestionnaire, setCurrentQuestionnaire, 
    previewQuestionnaire, setPreviewQuestionnaire,
    currentPreviewIndex, setCurrentPreviewIndex
}) => {
    const [tempSliderValue, setTempSliderValue] = useState(50);
    const [qResponses, setQResponses] = useState<number[]>(new Array(currentQuestionnaire.questions.length));
    const [matchedVideos, setMatchedVideos] = useState<VideoResponse[]>([]);

    const returnToDashboard = () => {
        setCurrentQuestionnaire({ id: 0, title: "", status: "", started: 0, completed: 0, last_modified: new Date().toISOString(), questions: []});
        setPreviewQuestionnaire(false);
    };

    const updateResponses = (
      answer: { id: number; text: string },
      index: number,
      multiple: boolean = false
    ) => {
      const temp = [...qResponses];

      // ensure array slot exists
      if (!temp[index]) temp[index] = multiple ? [] : null;

      if (multiple) {
        const current = Array.isArray(temp[index]) ? temp[index] : [];
        const exists = current.includes(answer.id);

        // toggle selection
        temp[index] = exists
          ? current.filter((id) => id !== answer.id)
          : [...current, answer.id];
      } else {
        temp[index] = answer.id;
      }

      setQResponses(temp);
    };


    const submitAnswers = () => {
        const requestData = {
            questionnaire_id: currentQuestionnaire.id,
            answer_ids: qResponses
        };
        console.log(qResponses)
        QuestionnairebuilderService.questionnairebuilderGetvideosCreate({ requestBody: requestData })
            .then(response => setMatchedVideos(response))
            .catch(error => console.log(error));
    };

    return (
      <div className="preview-container">
        {/* Header */}
        <div className="header-row">
          <h4 style={{ margin: 0 }}>{currentQuestionnaire.title}</h4>
          <button className="btn-back" onClick={returnToDashboard}>Return</button>
        </div>

        {/* Question Section */}
        <div className="question-grid">
          {currentQuestionnaire.questions.length > 0 && (
            <div className="question-card">
              {/* Render only the current question */}
              {(() => {
                const question = currentQuestionnaire.questions[currentPreviewIndex];
                const type = question.type;
                const savedResponse = qResponses[currentPreviewIndex]; // ✅ Get saved answer for this question

                return (
                  <>
                    <h5>{question.text}</h5>

                    {type === "slider" && (
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={
                          typeof savedResponse === "number"
                            ? savedResponse
                            : tempSliderValue
                        }
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setTempSliderValue(value);
                          updateResponses({ id: value, text: value.toString() }, currentPreviewIndex);
                        }}
                        className="form-input"
                      />
                    )}

                    {type === "text" && (
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        className="form-input"
                        value={typeof savedResponse === "string" ? savedResponse : ""}
                        onChange={(e) =>
                          updateResponses({ id: 0, text: e.target.value }, currentPreviewIndex)
                        }
                      />
                    )}

                    {type === "multichoice" &&
                      question.answers.map((answer: any) => (
                        <label key={answer.id} className="option-row">
                          <input
                            type="radio"
                            name={`q_${currentPreviewIndex}`}
                            checked={savedResponse === answer.id} // ✅ Reflect selection
                            onChange={() => updateResponses(answer, currentPreviewIndex)}
                          />
                          {answer.text}
                        </label>
                      ))}
                      
                      {/* CheckBox */}
                      {type === "checkbox" &&
                        question.answers.map((answer: any) => {
                          const selected = Array.isArray(qResponses[currentPreviewIndex])
                            ? qResponses[currentPreviewIndex]
                            : [];
                          const isChecked = selected.includes(answer.id);

                          const isNone = answer.text.trim().toLowerCase() === "none";

                          return (
                            <label key={answer.id} className="option-row">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const temp = [...qResponses];
                                  let current = Array.isArray(temp[currentPreviewIndex])
                                    ? [...temp[currentPreviewIndex]]
                                    : [];

                                  if (e.target.checked) {
                                    if (isNone) {
                                      // If "None" selected → clear all and only keep this one
                                      current = [answer.id];
                                    } else {
                                      // Add this answer, remove "None" if present
                                      const noneAnswer = question.answers.find(
                                        (a: any) => a.text.trim().toLowerCase() === "none"
                                      );
                                      if (noneAnswer) {
                                        current = current.filter((id) => id !== noneAnswer.id);
                                      }
                                      if (!current.includes(answer.id)) {
                                        current.push(answer.id);
                                      }
                                    }
                                  } else {
                                    // If unchecked → remove this one
                                    current = current.filter((id) => id !== answer.id);
                                  }

                                  temp[currentPreviewIndex] = current;
                                  setQResponses(temp);
                                }}
                              />
                              {answer.text}
                            </label>
                          );
                        })}


                    {/* ✅ Navigation buttons directly below the question */}
                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        gap: "12px",
                        justifyContent: "flex-start",
                      }}
                    >
                      <button
                        onClick={() => setCurrentPreviewIndex((i) => Math.max(i - 1, 0))}
                        disabled={currentPreviewIndex === 0}
                        className="nav-btn"
                      >
                        Previous
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPreviewIndex((i) =>
                            Math.min(i + 1, currentQuestionnaire.questions.length - 1)
                          )
                        }
                        disabled={
                          currentPreviewIndex === currentQuestionnaire.questions.length - 1
                        }
                        className="nav-btn"
                      >
                        Next
                      </button>
                    </div>
                  </>
                );
              })()}

            </div>
          )}
        </div>


        {/* Submit Button */}
        <div className="submit-container">
         <button className="btn-primary" onClick={submitAnswers}>
        Submit
        </button>
        </div>

        {/* Results */}
        <div className="results-panel">
          {matchedVideos.length > 0 ? (
            matchedVideos.map((video, index) => (
              <div key={video.id} className="video-card">
                <p><strong>{index + 1}: {video.title}</strong></p>
                <p><strong>Duration:</strong> {video.duration}</p>
                <p><strong>Description:</strong> {video.description}</p>
                {video.url && (
                  <p>
                    <strong>URL:</strong>{" "}
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      {video.url}
                    </a>
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="video-card empty">
              <p>No videos found matching your responses.</p>
            </div>
          )}
        </div>

        {/* Styles */}
        <style>{`
          .preview-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 900px;
          }
          .submit-container {
            display: flex;
            justify-content: center;
            margin-top: 10px;
            margin-bottom: 0px;
          }
          .submit-container .btn-primary {
            width: 100%;
            max-width: 900px;
            text-align: center;
          }
          .header-row {
            display: flex;
            justify-content: left;
            gap: 16px;
            align-items: center;
            margin-bottom: 12px;
          }
          .question-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }
          .question-card {
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .option-row {
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 14px;
          }
          .results-panel {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 20px;
          }
          .video-card {
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 12px;
            background: #fff;
          }
          .video-card.empty {
            text-align: center;
            background: #f5f5f5;
            color: #666;
          }
          .form-input {
            padding: 6px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
          }
          .btn-back, .btn-primary {
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            padding: 6px 12px;
          }
          .btn-back {
            background-color: #6c757d;
            color: white;
          }
          .btn-primary {
            background-color: #007bff;
            color: white;
          }
          .btn-back:hover, .btn-primary:hover {
            opacity: 0.85;
          }
          .nav-btn {
            background-color: white;
            color: black;
            border: 2px solid #007bff;
            border-radius: 4px;
            padding: 6px 16px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .nav-btn:hover:not(:disabled) {
            opacity: 0.85;
          }

          .option-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
          }

        `}</style>
      </div>
    );
};

export default ComponentPreview;