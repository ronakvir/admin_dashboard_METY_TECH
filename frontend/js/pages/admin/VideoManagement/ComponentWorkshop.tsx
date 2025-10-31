import { Dispatch, SetStateAction } from "react";
import { GetVideoWithCategories, VideoSearch } from "../../../api/types.gen";
import { VideomanagementService } from "../../../api/services.gen";

// Local types
type Category = {
  id: number;
  text: string;
  type: "type" | "level" | "stage";
};

type VideoData = {
  id: number;
  title: string;
  description: string;
  duration: string;
  url?: string | null;
  categories: Category[];
};

type VideoSearchFields = VideoSearch;

interface VideoManagementStates {
  searchFields: VideoSearchFields;
  setSearchFields: Dispatch<SetStateAction<VideoSearchFields>>;
  videoList: VideoData[];
  setVideoList: Dispatch<SetStateAction<VideoData[]>>;
  selectedVideo: VideoData;
  setSelectedVideo: Dispatch<SetStateAction<VideoData>>;
  videoWorkshop: string;
  setVideoWorkshop: Dispatch<SetStateAction<string>>;
  categoryList: Category[];
  setCategoryList: Dispatch<SetStateAction<Category[]>>;
}

export let indexCounter = 100;

const ComponentWorkshop: React.FC<VideoManagementStates> = ({
  searchFields,
  setSearchFields,
  videoList,
  setVideoList,
  selectedVideo,
  setSelectedVideo,
  videoWorkshop,
  setVideoWorkshop,
  categoryList,
  setCategoryList,
}) => {
  const updateTitleState = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVideo({ ...selectedVideo, title: e.target.value });
  };

  const updateDurationState = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVideo({ ...selectedVideo, duration: e.target.value });
  };

  const updateCategoryState = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newCategories = selectedVideo.categories.map((cat, i) =>
      i === index ? { ...cat, id: 0, text: e.target.value } : cat
    );
    setSelectedVideo({ ...selectedVideo, categories: newCategories });
  };

  const updateDescriptionState = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedVideo({ ...selectedVideo, description: e.target.value });
  };

  const updateUrlState = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVideo({ ...selectedVideo, url: e.target.value });
  };

  const removeCategoryField = (index: number) => {
    if (selectedVideo.categories.length < 2) return;
    const newCategories = [...selectedVideo.categories];
    newCategories.splice(index, 1);
    setSelectedVideo({ ...selectedVideo, categories: newCategories });
  };

  const cancelButton = () => {
    setVideoWorkshop("");
    setSelectedVideo({
      id: 0,
      title: "",
      description: "",
      duration: "",
      url: "",
      categories: [
        { id: 0, text: "", type: "type" },
        { id: 0, text: "", type: "level" },
        { id: 0, text: "", type: "stage" },
      ],
    });
  };

  const addVideoButton = () => {
    if (selectedVideo.url === "") {
      alert("You must enter a video URL!");
      return;
    }
    modifyVideoButton();
  };

  const modifyVideoButton = () => {
    if (selectedVideo.duration === "") {
      alert("You must enter a duration!");
      return;
    }
    if (selectedVideo.title === "") {
      alert("You must enter a title!");
      return;
    }
    if (selectedVideo.url === "") {
      alert("You must enter a video URL!");
      return;
    }
    for (let i = 0; i < selectedVideo.categories.length; i++) {
      if (selectedVideo.categories[i].text.trim() === "") {
        alert("You must remove empty category fields!");
        return;
      }
    }

    const areAllUnique =
      new Set(
        selectedVideo.categories.map((c: Category) => c.text.trim().toLowerCase())
      ).size === selectedVideo.categories.length;

    if (!areAllUnique) {
      alert("Category fields must be unique");
      return;
    }

    const createVideoData = {
      id: selectedVideo.id,
      title: selectedVideo.title,
      duration: selectedVideo.duration,
      description: selectedVideo.description,
      url: selectedVideo.url || "",
      categories: selectedVideo.categories.map((cat) => ({ text: cat.text })),
    };

    console.log(createVideoData);

    VideomanagementService.videomanagementCreatevideoCreate({ requestBody: createVideoData })
      .then((response) => {
        console.log(response.id);
        cancelButton();
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="video-management">
      {/* Header */}
      <div
        className="header-row"
        style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}
      >
        <h4 style={{ margin: 0 }}>
          {videoWorkshop === "new" ? "Add New Video" : "Modify Video"}
        </h4>
        <button className="btn-back" onClick={cancelButton}>
          Cancel
        </button>
      </div>

      {/* Form Panel */}
      <div className="form-panel" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Left Column */}
        <div
          className="form-column"
          style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "300px" }}
        >
          <h5 style={{ margin: "0 0 12px 0" }}>General Video Information</h5>
          <input
            type="text"
            value={selectedVideo.title}
            placeholder="Title"
            onChange={updateTitleState}
            className="form-input"
          />
          <input
            type="text"
            value={selectedVideo.url || ""}
            placeholder="Video URL (e.g., https://youtube.com/watch?v=...)"
            onChange={updateUrlState}
            className="form-input"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label>Duration (HH:MM:SS):</label>
            <input
              type="text"
              value={selectedVideo.duration}
              placeholder="e.g., 3:20, 45:30, 1:15:30"
              onChange={updateDurationState}
              className="form-input"
            />
          </div>
        </div>

        {/* Right Column */}
        <div
          className="form-column"
          style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "300px", flexGrow: 1 }}
        >
          <h5>Description</h5>
          <textarea
            style={{
              width: "100%",
              flexGrow: 1,
              height: "150px",
              padding: "6px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            onChange={updateDescriptionState}
            value={selectedVideo.description}
          />
        </div>
      </div>

      {/* Tags Section */}
      <div style={{ marginTop: "20px" }}>
        <h5 style={{ margin: "0 0 12px 0" }}>Tags</h5>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {["type", "level", "stage", "intensity"].map((catType) => (
            <div key={catType} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: 500 }}>
                {catType === "type"
                  ? "Fitness Type"
                  : catType === "level"
                  ? "Fitness Level"
                  : catType === "stage"
                  ? "Fitness Stage"
                  : "Fitness Intensity"}
              </label>

              {selectedVideo.categories
                .map((c, index) => ({ ...c, index }))
                .filter((c) => c.type === catType)
                .map((category) => (
                  <div key={category.index} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                    <input
                      list={
                        catType === "level"
                          ? "levelOptions"
                          : catType === "stage"
                          ? "stageOptions"
                          : catType === "intensity"
                          ? "intensityOptions"
                          : "categoryList"
                      }
                      onChange={(value) => updateCategoryState(value, category.index)}
                      value={category.text}
                      name="category"
                      type="text"
                      placeholder="Category"
                      className="form-input"
                    />
                    <button
                      className="btn-delete-small"
                      onClick={() => removeCategoryField(category.index)}
                    >
                      X
                    </button>
                  </div>
                ))}

              <button
                className="btn-gray"
                onClick={() =>
                  setSelectedVideo({
                    ...selectedVideo,
                    categories: [...selectedVideo.categories, { id: 0, text: "", type: catType }],
                  })
                }
              >
                Add {catType === "type" ? "Type" : catType === "level" ? "Level" : catType === "stage" ? "Stage" : "Intensity"}
              </button>
            </div>
          ))}
        </div>

        {/* Datalists */}
        <datalist id="categoryList">
          {categoryList.map((category: Category) => {
            if (selectedVideo.categories.some((c) => c.text === category.text)) return null;
            return <option key={category.id} value={category.text} />;
          })}
        </datalist>

        <datalist id="levelOptions">
          {["Beginner", "Intermediate", "Advanced"].map((level) => (
            <option key={level} value={level} />
          ))}
        </datalist>

        <datalist id="stageOptions">
          {["Warmup", "Primary", "Cooldown"].map((stage) => (
            <option key={stage} value={stage} />
          ))}
        </datalist>

        <datalist id="intensityOptions">
          {["Low", "Medium", "High"].map((intensity) => (
            <option key={intensity} value={intensity} />
          ))}
        </datalist>
      </div>

      {/* Submit Section */}
      <div className="submit-section" style={{ marginTop: "56px", textAlign: "left" }}>
        <button
          className={videoWorkshop === "new" ? "btn-search" : "btn-edit-small"}
          onClick={videoWorkshop === "new" ? addVideoButton : modifyVideoButton}
          style={{ padding: "8px 16px", fontSize: "15px" }}
        >
          {videoWorkshop === "new" ? "Add Video" : "Confirm Changes"}
        </button>
      </div>

      {/* Styles */}
      <style>{`
        .form-input { padding: 6px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px; }
        .btn-back, .btn-search, .btn-edit-small, .btn-delete-small, .btn-gray { border: none; border-radius: 4px; cursor: pointer; font-size: 14px; padding: 6px 12px; }
        .btn-back { background-color: #6c757d; color: white; }
        .btn-search { background-color: #007bff; color: white; }
        .btn-edit-small { background-color: #007bff; color: white; font-size: 12px; padding: 4px 8px; }
        .btn-delete-small { background-color: #dc3545; color: white; font-size: 12px; padding: 4px 8px; }
        .btn-gray { background-color: #6c757d; color: white; font-size: 12px; padding: 4px 8px; }
        .btn-back:hover, .btn-search:hover, .btn-edit-small:hover, .btn-delete-small:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
};

export default ComponentWorkshop;
