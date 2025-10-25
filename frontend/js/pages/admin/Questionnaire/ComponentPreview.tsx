import { useEffect, FC, useState } from "react";
import { QuestionnaireStates } from "./QuestionnaireBuilder"
import { QuestionnairebuilderService } from "../../../api/services.gen";
import { VideoResponse } from "../../../api/types.gen";

// Define the type for responses - can be number, number[], or string
type ResponseValue = number | number[] | string;

const ComponentPreview: FC<QuestionnaireStates> = ({ 
    currentQuestionnaire, setCurrentQuestionnaire, 
    previewQuestionnaire, setPreviewQuestionnaire,
    currentPreviewIndex, setCurrentPreviewIndex
}) => {
    const [tempSliderValue, setTempSliderValue] = useState(50);
  
    const [qResponses, setQResponses] = useState<ResponseValue[]>(new Array(currentQuestionnaire.questions.length));
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
      if (!temp[index]) temp[index] = multiple ? [] : 0;

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
        // Flatten the responses for the API call
        const flattenedAnswers: number[] = [];
        qResponses.forEach(response => {
            if (Array.isArray(response)) {
                flattenedAnswers.push(...response);
            } else if (typeof response === 'number') {
                flattenedAnswers.push(response);
            }
            // Skip string responses for now????
        });

        const requestData = {
            questionnaire_id: currentQuestionnaire.id,
            answer_ids: flattenedAnswers
        };
        console.log(flattenedAnswers)
        QuestionnairebuilderService.questionnairebuilderGetvideosCreate({ requestBody: requestData })
            .then(response => setMatchedVideos(response))
            .catch(error => console.log(error));
    };

    // WORKOUT RENDERING FUNCTION
    const renderWorkoutSequence = (videos: any[]) => {
      // Separate metadata from segments
      const workoutMetadata = videos.find(v => v.is_metadata);
      const workoutSegments = videos.filter(v => v.is_workout_segment && !v.is_metadata);
      
      // If no workout structure, go back to individual videos
      if (!workoutMetadata || workoutSegments.length === 0) {
        return (
          <div className="individual-videos">
            <h4>Recommended Videos:</h4>
            {videos.filter(v => !v.is_metadata && !v.is_workout_segment).map((video, index) => (
              <div key={video.id || index} className="video-card">
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
            ))}
          </div>
        );
      }

      return (
        <div className="workout-sequence">
          {/* Workout Header */}
          <div className="workout-header">
            <h3>{workoutMetadata.workout_metadata?.workout_type || 'Workout'}</h3>
            <div className="workout-meta">
              <span className="workout-badge">Total: {workoutMetadata.workout_metadata?.total_duration || 0}s</span>
              <span className="workout-badge">{workoutMetadata.workout_metadata?.segment_count || 0} segments</span>
            </div>
          </div>

          {/* Workout Segments */}
          <div className="workout-segments">
            {workoutSegments.map((segment, index) => (
              <div key={segment.id} className={`workout-segment ${segment.slot_type}`}>
                {/* Segment Header */}
                <div className="segment-header">
                  <div>
                    <span className="segment-badge">Segment {segment.segment_number}</span>
                    <span className={`segment-type ${segment.slot_type}`}>
                      {segment.slot_type}
                    </span>
                  </div>
                  <span className="segment-duration">{segment.duration}s</span>
                </div>

                {/* Segment Content */}
                <div className="segment-content">
                  <h4>{segment.title}</h4>
                  <p>{segment.description}</p>
                  
                  {segment.url && segment.slot_type === 'exercise' && (
                    <div className="video-container">
                      <video 
                        src={segment.url} 
                        controls 
                        className="exercise-video"
                      />
                    </div>
                  )}
                  
                  {!segment.url && segment.slot_type !== 'exercise' && (
                    <div className="no-video-placeholder">
                      <div className="placeholder-icon">
                        {segment.slot_type === 'rest' ? '⏱️' : 
                         segment.slot_type === 'warmup' ? '🔥' : 
                         segment.slot_type === 'cooldown' ? '🧘' : '⚡'}
                      </div>
                      <p>
                        <strong>
                          {segment.slot_type === 'rest' ? 'Rest Period' : 
                           segment.slot_type === 'warmup' ? 'Warmup Segment' : 
                           segment.slot_type === 'cooldown' ? 'Cooldown Segment' : 'Segment'}
                        </strong>
                        <br/>
                        {segment.duration} seconds
                      </p>
                    </div>
                  )}
                </div>

                {/* Segment Connector (except for last segment) */}
                {index < workoutSegments.length - 1 && (
                  <div className="segment-connector">
                    <div className="connector-line"></div>
                    <span>↓ Next</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Workout Summary */}
          <div className="workout-summary">
            <h5>Workout Complete! 🎉</h5>
            <p>
              You've finished {workoutMetadata.workout_metadata?.workout_type || 'the workout'} 
              in {workoutMetadata.workout_metadata?.total_duration || 0} seconds
            </p>
          </div>
        </div>
      );
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
                const savedResponse = qResponses[currentPreviewIndex];

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
                            checked={savedResponse === answer.id}
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


                    {/* Navigation buttons */}
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
            renderWorkoutSequence(matchedVideos)
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

          /* Workout Sequence Styles */
          .workout-sequence {
            max-width: 800px;
            margin: 0 auto;
          }
          .workout-header {
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
          }
          .workout-header h3 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .workout-meta {
            display: flex;
            gap: 15px;
            justify-content: center;
          }
          .workout-badge {
            background: #007bff;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
          }
          .workout-segment {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
            transition: transform 0.2s ease;
          }
          .workout-segment:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .workout-segment.warmup {
            border-left: 5px solid #ffc107;
          }
          .workout-segment.exercise {
            border-left: 5px solid #28a745;
          }
          .workout-segment.rest {
            border-left: 5px solid #6c757d;
          }
          .workout-segment.cooldown {
            border-left: 5px solid #17a2b8;
          }
          .segment-header {
            background: #f8f9fa;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #dee2e6;
          }
          .segment-badge {
            background: #6c757d;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 8px;
          }
          .segment-type {
            background: #17a2b8;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            text-transform: capitalize;
          }
          .segment-type.warmup { background: #ffc107; color: black; }
          .segment-type.exercise { background: #28a745; }
          .segment-type.rest { background: #6c757d; }
          .segment-type.cooldown { background: #17a2b8; }
          .segment-duration {
            color: #6c757d;
            font-weight: bold;
          }
          .segment-content {
            padding: 20px;
          }
          .segment-content h4 {
            margin: 0 0 8px 0;
            color: #333;
          }
          .segment-content p {
            margin: 0 0 12px 0;
            color: #666;
          }
          .exercise-video {
            width: 100%;
            max-height: 300px;
            border-radius: 6px;
            border: 1px solid #dee2e6;
          }
          .no-video-placeholder {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 6px;
            padding: 30px;
            text-align: center;
            color: #6c757d;
          }
          .placeholder-icon {
            font-size: 2rem;
            margin-bottom: 10px;
            opacity: 0.7;
          }
          .segment-connector {
            background: #f8f9fa;
            padding: 10px;
            text-align: center;
            color: #6c757d;
          }
          .connector-line {
            width: 2px;
            height: 20px;
            background: #6c757d;
            margin: 0 auto 5px auto;
            opacity: 0.6;
          }
          .workout-summary {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-top: 20px;
          }
          .workout-summary h5 {
            margin: 0 0 10px 0;
            color: #155724;
          }
          .workout-summary p {
            margin: 0;
            color: #155724;
          }
        `}</style>
      </div>
    );
};

export default ComponentPreview;