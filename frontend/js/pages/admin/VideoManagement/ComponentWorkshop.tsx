import { Dispatch, SetStateAction } from "react";
import { GetVideoWithCategories, VideoSearch } from "../../../api/types.gen";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { VideomanagementService } from "../../../api/services.gen";

// Define local types based on the API structure
type Category = {
    id: number;
    text: string;
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
    searchFields:               VideoSearchFields;       setSearchFields:            Dispatch<SetStateAction<VideoSearchFields>>;
    videoList:                  VideoData[];        setVideoList:               Dispatch<SetStateAction<VideoData[]>>; 
    selectedVideo:              VideoData;          setSelectedVideo:           Dispatch<SetStateAction<VideoData>>; 
    videoWorkshop:              string;             setVideoWorkshop:           Dispatch<SetStateAction<string>>;
    categoryList:               Category[];         setCategoryList:            Dispatch<SetStateAction<Category[]>>;
}
export let indexCounter = 100;
const ComponentWorkshop: React.FC<VideoManagementStates> = ({
    searchFields, setSearchFields,
    videoList, setVideoList,
    selectedVideo, setSelectedVideo,
    videoWorkshop, setVideoWorkshop,
    categoryList, setCategoryList,}) => {



        const updateTitleState = (newText: React.ChangeEvent<HTMLInputElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.title = newText.target.value;
            setSelectedVideo(tempSearchFields);
        }
    
        const updateDurationState = (selectedOption: React.ChangeEvent<HTMLInputElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.duration = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }
    
        const updateCategoryState = (selectedOption: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const tempSearchFields = {...selectedVideo};

            tempSearchFields.categories[index].id = 0
            tempSearchFields.categories[index].text = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const updateDescriptionState = (selectedOption: React.ChangeEvent<HTMLTextAreaElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.description = selectedOption.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const updateUrlState = (newText: React.ChangeEvent<HTMLInputElement>) => {
            const tempSearchFields = {...selectedVideo};
            tempSearchFields.url = newText.target.value;
            setSelectedVideo(tempSearchFields);
        }

        const removeCategoryField = (index: number) => {
            if (selectedVideo.categories.length < 2) return;

            const tempSearchFields = [ ...selectedVideo.categories ];
            tempSearchFields.splice(index, 1);
            setSelectedVideo({ ...selectedVideo, categories: tempSearchFields });
        }

        const cancelButton = () => {
            setVideoWorkshop("");
            setSelectedVideo({id: 0, title: "", description: "", duration: "", url: "", categories: [{id: 0, text: ""}]});
        }

        // Calls the modify video function - they invoke the same API
        const addVideoButton = () => {
            // do input validation
            if (selectedVideo.url === "") {alert("You must enter a video URL!"); return;}
            modifyVideoButton();
        }

        const modifyVideoButton = () => {
            if (selectedVideo.duration === "") {alert("You must enter a duration!"); return; }
            if (selectedVideo.title === "") {alert("You must enter a title!");return;}
            if (selectedVideo.url === "") {alert("You must enter a video URL!"); return;}
            for (let i = 0; i < selectedVideo.categories.length; i++) {if (selectedVideo.categories[i].text === "") {alert("You must remove empty category fields!"); return;}}

            const areAllUnique = new Set(selectedVideo.categories.map((c: Category) => c.text.trim().toLowerCase())).size === selectedVideo.categories.length;
            if (!areAllUnique) {alert("Category fields must be unique"); return;}

            // Convert VideoData to CreateVideo format
            const createVideoData = {
                id: selectedVideo.id,
                title: selectedVideo.title,
                duration: selectedVideo.duration,
                description: selectedVideo.description,
                url: selectedVideo.url || "",
                categories: selectedVideo.categories.map(cat => ({ text: cat.text }))
            };
            
            console.log(createVideoData);
            VideomanagementService.videomanagementCreatevideoCreate({ requestBody: createVideoData })
                .then( response => {
                    console.log(response.id);
                    setVideoWorkshop("");
                    setSelectedVideo({id: 0, title: "", description: "", duration: "", url: "", categories: [{id: 0, text: ""}]});
                })
                .catch( error => console.log(error) )
        }

        return (
  <div className="video-management">
    {/* Header */}
    <div
      className="header-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      <h4 style={{ margin: 0 }}>
        {videoWorkshop === "new" ? "Add New Video" : "Modify Video"}
      </h4>
      <button className="btn-back" onClick={cancelButton}>
        Cancel
      </button>
    </div>

{/* Form Panel */}
    <div
      className="form-panel"
      style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
    >
      {/* Left Column */}
      <div
        className="form-column"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: "300px",
        }}
      >
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

        {/* Categories */}
{selectedVideo.categories.map((category: Category, index: number) => (
  <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <input
      list="categoryList"
      onChange={(value) => updateCategoryState(value, index)}
      value={selectedVideo.categories[index].text}
      name="category"
      type="text"
      placeholder="Category"
      className="form-input"
    />
    <button
      className="btn-delete-small"
      onClick={() => removeCategoryField(index)}
    >
      X
    </button>
    {index === selectedVideo.categories.length - 1 && (
      <button
        className="btn-add-category"
        onClick={() =>
          setSelectedVideo({
            ...selectedVideo,
            categories: [...selectedVideo.categories, { id: 0, text: "" }],
          })
        }
      >
        Add Category
      </button>
      )}
  </div>
))}
<datalist id="categoryList">
  {categoryList.map((category: Category) => {
    if (selectedVideo.categories.some((c) => c.text === category.text)) return null;
    return <option key={category.id} value={category.text} />;
  })}
</datalist>


        {/* Submit Button */}
        <button
          className={
            videoWorkshop === "new" ? "btn-search" : "btn-edit-small"
          }
          onClick={
            videoWorkshop === "new" ? addVideoButton : modifyVideoButton
          }
        >
          {videoWorkshop === "new" ? "Add Video" : "Confirm Changes"}
        </button>
      </div>

      {/* Right Column */}
      <div
        className="form-column"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: "300px",
        }}
      >
        <h5>Description</h5>
        <textarea
          style={{
            width: "350px",
            height: "150px",
            padding: "6px",
            fontSize: "14px",
          }}
          onChange={(e) => updateDescriptionState(e)}
          value={selectedVideo.description}
        />
      </div>
    </div>

    {/* Styles */}
    <style>{`
      .form-input {
        padding: 6px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .btn-back, .btn-search, .btn-edit-small, .btn-delete-small {
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        padding: 6px 12px;
      }
      .btn-back { background-color: #6c757d; color: white; }
      .btn-search { background-color: #007bff; color: white; }
      .btn-edit-small { background-color: #007bff; color: white; font-size: 12px; padding: 4px 8px; border: 2px solid #007bff }
      .btn-delete-small { background-color: #dc3545; color: white; font-size: 12px; padding: 4px 8px; border: 2px solid #dc3545 }
      .btn-back:hover, .btn-search:hover, .btn-edit-small:hover, .btn-delete-small:hover { opacity: 0.85; }
      .btn-add-category {
        width: 100%;
        padding: 4px 8px;
        background: white;
        color: #007bff;
        border: 2px solid #007bff;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-add-category:hover {
        background: #007bff;
        color: white;
      }
    `}</style>
</div>

        );
}

export default ComponentWorkshop;