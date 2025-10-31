import { Dispatch, SetStateAction } from "react";
import { categoryTable, videoCategoriesMappingTable, videoTable } from "../../database";
import { GetVideoWithCategories, VideoSearch } from "../../../api/types.gen";
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
  level?: string;
  stage?: string;
  intensity?: string;
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

const ComponentVideoSearch: React.FC<VideoManagementStates> = ({
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
    setSearchFields({ ...searchFields, title: e.target.value });
  };

  const updateDurationState = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFields({ ...searchFields, duration: e.target.value });
  };

  const updateCategoryState = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFields({ ...searchFields, category: e.target.value });
  };

  const modifyVideoButton = (video: VideoData) => {
    setVideoList([]);
    setSelectedVideo(video);
    setVideoWorkshop("modify");
    setSearchFields({ title: "", duration: "", category: "" });
  };

  const addVideoButton = () => {
    setVideoList([]);
    setSelectedVideo({
      id: 0,
      title: "",
      description: "",
      duration: "",
      url: "",
      categories: [{ id: 0, text: "" }],
    });
    setVideoWorkshop("new");
    setSearchFields({ title: "", duration: "", category: "" });
  };

  // GET VIDEOS API
  const searchButton = () => {
    setVideoList([]);

    const requestData: VideoSearch = {
      title: searchFields.title,
      duration: searchFields.duration,
      category: searchFields.category,
      level: searchFields.level,
      stage: searchFields.stage,
      intensity: searchFields.intensity
    };

    VideomanagementService.videomanagementGetvideosCreate({ requestBody: requestData })
      .then((response) => {
        const videoDataList: VideoData[] = response.map((video) => ({
          id: video.id,
          title: video.title,
          duration: video.duration,
          description: video.description,
          url: video.url || "",
          categories: Array.isArray(video.categories) ? video.categories : [],
        }));
        setVideoList(videoDataList);
      })
      .catch((error) => console.log(error));
  };

  // DELETE VIDEO API
  const deleteVideoButton = (videoID: number) => {
    if (confirm("This will permanently delete this video. Are you sure?")) {
      VideomanagementService.videomanagementDeletevideoDestroy({ id: videoID })
        .then(() => {
          const tempVideoList = [...videoList];
          const index = videoList.findIndex((video) => video.id === videoID);
          tempVideoList.splice(index, 1);
          setVideoList(tempVideoList);
          setSearchFields({ title: "", duration: "", category: "" });
        })
        .catch((error) => console.log(error));
    }
  };

  return (
    <div className="video-management">
      {/* Header */}
      <div className="header-row">
        <h4>Search Videos</h4>
        <button className="btn-back" onClick={addVideoButton}>Add New Video</button>
      </div>

      {/* Search Panel */}
      <div className="search-panel">
        <h5>General Video Information</h5>
        <input type="text" placeholder="Title" onChange={updateTitleState} />
        <input type="text" placeholder="Duration (e.g., 3:20, 45:30)" onChange={updateDurationState} />

        <h5 style={{ margin: "8px 0 4px 0" }}>Tags</h5>
        <div className="tags-row">
          {/* Fitness Type */}
          <div className="tag-field">
            <label>Fitness Type:</label>
            <input
              list="categoryList"
              type="text"
              placeholder="Type"
              onChange={(e) => setSearchFields({ ...searchFields, category: e.target.value })}
            />
            <datalist id="categoryList">
              {categoryList.map((category) => (
                <option key={category.id} value={category.text} />
              ))}
            </datalist>
          </div>

          {/* Fitness Level */}
          <div className="tag-field">
            <label>Fitness Level:</label>
            <input
              list="levelOptions"
              type="text"
              placeholder="Level"
              onChange={(e) => setSearchFields({ ...searchFields, level: e.target.value })}
            />
            <datalist id="levelOptions">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <option key={level} value={level} />
              ))}
            </datalist>
          </div>

          {/* Fitness Stage */}
          <div className="tag-field">
            <label>Fitness Stage:</label>
            <input
              list="stageOptions"
              type="text"
              placeholder="Stage"
              onChange={(e) => setSearchFields({ ...searchFields, stage: e.target.value })}
            />
            <datalist id="stageOptions">
              {["Warmup", "Primary", "Cooldown"].map((stage) => (
                <option key={stage} value={stage} />
              ))}
            </datalist>
          </div>

          {/* Fitness Intensity */}
          <div className="tag-field">
            <label>Fitness Intensity:</label>
            <input
              list="intensityOptions"
              type="text"
              placeholder="Intensity"
              onChange={(e) => setSearchFields({ ...searchFields, intensity: e.target.value })}
            />
            <datalist id="intensityOptions">
              {["Low", "Medium", "High"].map((intensity) => (
                <option key={intensity} value={intensity} />
              ))}
            </datalist>
          </div>
        </div>

        <button className="btn-search" onClick={searchButton}>Search</button>
      </div>

      {/* Video Table Header */}
      {videoList.length > 0 && (
        <div className="video-table-header">
          <span style={{ width: "300px" }}>Title</span>
          <span style={{ width: "100px" }}>Duration</span>
          <span style={{ width: "300px" }}>URL</span>
          <span style={{ width: "200px" }}>Categories</span>
          <span style={{ width: "150px" }}>Actions</span>
        </div>
      )}

      {/* Video List */}
      {videoList.map((video) => (
        <div key={video.id} className="video-row">
          <span style={{ width: "300px" }}>{video.title}</span>
          <span style={{ width: "100px" }}>{video.duration}</span>
          <span style={{ width: "300px", wordBreak: "break-all" }}>{video.url || "No URL"}</span>
          <div style={{ display: "flex", flexDirection: "column", width: "200px" }}>
            {video.categories.map((cat, idx) => (
              <span key={idx}>{cat.text}</span>
            ))}
          </div>
          <div className="action-buttons">
            <button className="btn-edit-small" onClick={() => modifyVideoButton(video)}>Modify</button>
            <button className="btn-delete-small" onClick={() => deleteVideoButton(video.id)}>Delete</button>
          </div>
        </div>
      ))}

      {/* Styles */}
      <style>{`
        .video-management {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .search-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-bottom: 20px;
        }
        .search-panel input {
          padding: 6px;
          font-size: 14px;
        }
        .btn-back, .btn-search, .btn-edit-small, .btn-delete-small {
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
        .btn-search {
          background-color: #007bff;
          color: white;
        }
        .btn-edit-small {
          background-color: #007bff;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
        }
        .btn-delete-small {
          background-color: #dc3545;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
        }
        .btn-back:hover, .btn-search:hover, .btn-edit-small:hover, .btn-delete-small:hover {
          opacity: 0.85;
        }
        .video-table-header, .video-row {
          display: flex;
          flex-direction: row;
          padding: 8px;
          border: 1px solid #ddd;
          align-items: center;
        }
        .video-table-header {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .video-row:nth-child(odd) {
          background-color: #fafafa;
        }
        .video-row:hover {
          background-color: #f1f1f1;
        }
        .action-buttons {
          display: flex;
          gap: 6px;
          width: 150px;
        }
        .tags-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .tag-field {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 150px;
        }
      `}</style>
    </div>
  );
};

export default ComponentVideoSearch;
